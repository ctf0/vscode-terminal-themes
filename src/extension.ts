'use strict';

import {
    window,
    commands,
    workspace,
    ExtensionContext
} from 'vscode';

let themes

export function activate(context: ExtensionContext) {
    themes = require('./../assets/themes.json')
    const settings = getSettings()
    let enabled = settings.enable

    // quick pick menu
    if (enabled) {
        context.subscriptions.push(
            commands.registerCommand('terminal_themes.apply', async () => {
                let items = themes.map((item) => item.name)
                items.push("Non (remove all terminal styling)")

                window.showQuickPick(items, {
                    placeHolder: 'Search Terminal Theme (up/down to preview)',
                    onDidSelectItem: async (selection) => {
                        // preview
                        await updateTerminalScheme(selection)
                    }
                }).then((selection) => {
                    if (!selection) {
                        // make sure applied scheme is in-sync
                        return updateTerminalScheme(getSettings().style)
                    }

                    // apply
                    updateConfig(
                        'terminal_themes.style',
                        selection,
                        window.showInformationMessage(`Terminal Theme: "${selection}" applied`)
                    )
                })
            })
        )
    }

    // auto update on change
    workspace.onDidChangeConfiguration((event) => {
        if (enabled && event.affectsConfiguration('terminal_themes.style')) {
            updateTerminalScheme(getSettings().style)
        }
    })
}

export function deactivate() { }

/**
 * get settings
 *
 * @return  {[type]}  [return description]
 */
function getSettings() {
    return workspace.getConfiguration('terminal_themes')
}

/**
 * get scheme
 *
 * @param   {[type]}  style  [style description]
 *
 * @return  {[type]}         [return description]
 */
function getScheme(style) {
    if (!style.includes('Non')) {
        let scheme = themes.filter((item) => item.name == style)

        if (scheme.length) {
            return scheme[0].colors
        }

        return window.showErrorMessage('sorry, theme not found!')
    }

    return {}
}
/**
 * apply scheme
 *
 * @param   {[type]}  style  [style description]
 *
 * @return  {[type]}         [return description]
 */
async function updateTerminalScheme(style) {
    let current = workspace.getConfiguration().get('workbench.colorCustomizations')
    let data = await clearOldStyles(current)
    let scheme = await getScheme(style)
    data = Object.assign(data, scheme)

    return updateConfig('workbench.colorCustomizations', data)
}

/**
 * update user config
 *
 * @param   {[type]}  key   [key description]
 * @param   {[type]}  data  [data description]
 * @param   {[type]}  msg  [data description]
 *
 * @return  {[type]}        [return description]
 */
function updateConfig(key, data, msg: any = true) {
    return workspace.getConfiguration().update(key, data, true)
        .then(
            () => msg,
            (reason) => window.showErrorMessage(reason)
        );
}

/**
 * clear old styles from user settings
 *
 * @param   {[type]}  list  [list description]
 *
 * @return  {[type]}        [return description]
 */
function clearOldStyles(list) {
    return Object.keys(list).reduce((object, key) => {
        if (!key.includes('terminal')) {
            object[key] = list[key]
        }
        return object
    }, {})
}
