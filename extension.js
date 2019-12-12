const fs = require('fs')
const path = require('path')
const vscode = require('vscode')

let themes = []
const removeTheme = 'Non (remove all terminal styling)'
const colorsConfig = 'workbench.colorCustomizations'
const debounce = require('lodash.debounce')

function activate(context) {
    loadThemes()
    const settings = getSettings()
    let enabled = settings.enable

    // quick pick menu
    if (enabled) {
        context.subscriptions.push(
            vscode.commands.registerCommand('terminal_themes.apply', async () => {
                let items = await themes.map((item) => item.name)
                items.push(removeTheme)

                vscode.window.showQuickPick(items, {
                    ignoreFocusOut: true,
                    placeHolder: 'Search Terminal Theme (up/down to preview)',
                    onDidSelectItem: debounce(function (selection) {
                        // preview
                        updateTerminalScheme(selection)
                    }, 300)
                }).then((selection) => {
                    if (!selection) {
                        // make sure applied scheme is in-sync
                        return updateTerminalScheme(getSettings().style)
                    }

                    // apply
                    updateConfig(
                        'terminal_themes.style',
                        selection,
                        vscode.window.showInformationMessage(`Terminal Theme: "${selection}" applied`)
                    )
                })
            })
        )
    }

    // auto update on change
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (enabled && event.affectsConfiguration('terminal_themes.style')) {
            updateTerminalScheme(getSettings().style)
        }
    })
}

exports.activate = activate

function deactivate() { }
exports.deactivate = deactivate

function loadThemes() {
    const folder = path.join(__dirname, './themes')

    fs.readdirSync(folder).forEach((file) => {
        themes.push(...require(`${folder}/${file}`))
    })
}

function getSettings() {
    return vscode.workspace.getConfiguration('terminal_themes')
}

function getScheme(style) {
    let scheme = themes.filter((item) => item.name == style)
    if (scheme.length) {
        return scheme[0].colors
    }

    return false
}

async function updateTerminalScheme(style) {
    let current = vscode.workspace.getConfiguration().get(colorsConfig)
    let data = await clearOldStyles(current)
    if (style != removeTheme) {
        let scheme = await getScheme(style)
        if (!scheme) {
            return vscode.window.showErrorMessage('sorry, theme not found!')
        }
        data = Object.assign(data, scheme)
    }

    return await updateConfig(colorsConfig, data)
}

function updateConfig(key, data, msg = true) {
    return vscode.workspace.getConfiguration().update(key, data, true)
        .then(() => msg, (reason) => vscode.window.showErrorMessage(reason))
}

function clearOldStyles(list) {
    return Object.keys(list).reduce((object, key) => {
        if (!key.includes('terminal')) {
            object[key] = list[key]
        }

        return object
    }, {})
}
