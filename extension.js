const fs = require('fs')
const path = require('path')
const vscode = require('vscode')

let themes = []
const removeTheme = 'Non (remove all terminal styling)'
const colorsConfig = 'workbench.colorCustomizations'
const debounce = require('lodash.debounce')

async function activate(context) {
    await loadThemes()

    // quick pick menu
    context.subscriptions.push(
        vscode.commands.registerCommand('terminal_themes.apply', async () => {
            let items = themes.map((item) => item.name).concat([removeTheme])

            await vscode.window.showQuickPick(items, {
                ignoreFocusOut: true,
                placeHolder: 'Search Terminal Theme (up/down to preview)',
                onDidSelectItem: debounce(function (selection) {
                    // preview
                    return updateTerminalScheme(selection)
                }, 300)
            }).then(async (selection) => {
                if (!selection) {
                    // make sure applied scheme is in-sync
                    return updateTerminalScheme(await getSettings('style'))
                }

                // apply
                return updateConfig(
                    'terminal_themes.style',
                    selection,
                    vscode.window.showInformationMessage(`Terminal Theme: "${selection}" applied`)
                )
            })
        })
    )

    // auto update on change
    vscode.workspace.onDidChangeConfiguration(async (event) => {
        if (enabled && event.affectsConfiguration('terminal_themes.style')) {
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
    return vscode.workspace.getConfiguration('terminal_themes')[key]
}

function getScheme(style) {
    let scheme = themes.filter((item) => item.name == style)
    if (scheme.length) {
        return scheme[0].colors
    }

    return false
}

async function updateTerminalScheme(style) {
    let current = await vscode.workspace.getConfiguration().get(colorsConfig)
    let data = await clearOldStyles(current)

    if (style != removeTheme) {
        let scheme = getScheme(style)
        if (!scheme) {
            return vscode.window.showErrorMessage('sorry, theme not found!')
        }

        data = Object.assign(data, scheme)
    }

    return updateConfig(colorsConfig, data)
}

async function updateConfig(key, data) {
    try {
        await vscode.workspace.getConfiguration().update(key, data, true)
    } catch ({ message }) {
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
