const fs = require('fs')
const path = require('path')
const vscode = require('vscode')
const debounce = require('lodash.debounce')

const REMOVE_THEME = 'Non (remove all terminal styling)'
const PACKAGE_NAME = 'terminalThemes'
const NAME = `${PACKAGE_NAME}.style`
const COLORS_CONFIG = 'workbench.colorCustomizations'
let themes = []

async function activate(context) {
    await loadThemes()

    // quick pick menu
    context.subscriptions.push(
        vscode.commands.registerCommand(`${PACKAGE_NAME}.apply`, async () => {
            const currentStyles = await getCurrentStyles()
            const rawStyles = await getCleanStyles()

            await vscode.window.showQuickPick(
                themes.map((item) => item.name).concat([REMOVE_THEME]),
                {
                    ignoreFocusOut  : true,
                    placeHolder     : 'Search Terminal Theme (up/down to preview)',
                    onDidSelectItem : debounce(async function (selection) {
                        // preview
                        await updateTerminalScheme(selection, rawStyles)
                    }, 300)
                }
            ).then(async (selection) => {
                if (!selection) {
                    // make sure applied scheme is in-sync
                    return updateConfig(COLORS_CONFIG, currentStyles)
                }

                // apply
                return updateConfig(
                    NAME,
                    selection,
                    vscode.window.showInformationMessage(`Terminal Theme: "${selection}" applied`)
                )
            })
        })
    )

    // auto update on change
    vscode.workspace.onDidChangeConfiguration(async (event) => {
        if (event.affectsConfiguration(NAME)) {
            return updateTerminalScheme(await getSettings('style'))
        }
    })
}

async function loadThemes() {
    const folder = path.join(__dirname, './themes')

    await fs.readdir(folder, (err, files) => {
        files.forEach((file) => {
            themes.push(...require(`${folder}/${file}`))
        })
    })
}

async function getSettings(key = null) {
    return vscode.workspace.getConfiguration(PACKAGE_NAME)[key]
}

function getScheme(style) {
    let scheme = themes.filter((item) => item.name == style)

    if (scheme.length) {
        return scheme[0].colors
    }

    return false
}

async function getCurrentStyles() {
    return vscode.workspace.getConfiguration().get(COLORS_CONFIG)
}

async function getCleanStyles() {
    return clearOldStyles(await getCurrentStyles())
}

async function updateTerminalScheme(theme_name, rawStyles = null) {
    let data = rawStyles || await getCleanStyles()

    if (theme_name != REMOVE_THEME) {
        let scheme = getScheme(theme_name)

        if (!scheme) {
            return vscode.window.showErrorMessage('sorry, theme not found!')
        }

        data = Object.assign({}, data, scheme)
    }

    return updateConfig(COLORS_CONFIG, data)
}

async function updateConfig(key, data) {
    try {
        await vscode.workspace.getConfiguration().update(key, data, true)
    } catch ({message}) {
        return vscode.window.showErrorMessage(message)
    }
}

function clearOldStyles(list) {
    return new Promise((resolve) => {
        let data = Object.keys(list).reduce((object, key) => {
            if (!key.includes('terminal')) {
                object[key] = list[key]
            }

            return object
        }, {})

        resolve(data)
    })
}

exports.activate = activate

function deactivate() { }
exports.deactivate = deactivate
