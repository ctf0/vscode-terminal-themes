'use strict';

import {
    window,
    commands,
    workspace,
    ExtensionContext
} from 'vscode';

let themes

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
    let scheme = themes.filter((item) => item.name == style)

    if (scheme.length) {
        return scheme[0].colors
    }

    window.showErrorMessage('sorry, theme not found!')
}
/**
 * apply scheme
 *
 * @param   {[type]}  style  [style description]
 *
 * @return  {[type]}         [return description]
 */
function updateTerminalScheme(style) {
    let current = workspace.getConfiguration().get('workbench.colorCustomizations')
    let data

    if (style == 'Non') {
        data = clearOldStyles(current)
    } else {
        data = clearOldStyles(current)
        data = Object.assign(data, getScheme(style))
    }

    return updateConfig('workbench.colorCustomizations', data)
}

/**
 * update user config
 *
 * @param   {[type]}  key   [key description]
 * @param   {[type]}  data  [data description]
 *
 * @return  {[type]}        [return description]
 */
function updateConfig(key, data) {
    return workspace.getConfiguration().update(key, data, true)
        .then(
            () => true,
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

export function activate(context: ExtensionContext) {
    themes = require('./../assets/themes.json')
    const settings = getSettings()
    let enabled = settings.enable

    // quick pick menu
    if (enabled) {
        context.subscriptions.push(
            commands.registerCommand('terminal_themes.apply', async () => {
                let items = themes.map((item) => item.name)

                window.showQuickPick(items).then((selection) => {
                    if (!selection) {
                        return
                    }

                    return updateConfig('terminal_themes.style', selection)
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
