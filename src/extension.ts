'use strict';

import {
    window,
    workspace,
    ExtensionContext
} from 'vscode';

/**
 * get settings
 *
 * @return  {[type]}  [return description]
 */
function getSettings() {
    return workspace.getConfiguration('terminal_themes')
}

/**
 * read theme files and get scheme colors
 *
 * @param   {[type]}  style  [style description]
 *
 * @return  {[type]}         [return description]
 */
function getScheme(style) {
    let themes = require('./../assets/themes.json')
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
        data = Object.keys(current).reduce((object, key) => {
            if (!key.includes('terminal')) {
                object[key] = current[key]
            }
            return object
        }, {})
    } else {
        data = Object.assign(current, getScheme(style))
    }

    return workspace.getConfiguration().update('workbench.colorCustomizations', data, true)
        .then(
            () => true,
            (reason) => window.showErrorMessage(reason)
        );
}

export function activate(context: ExtensionContext) {
    const settings = getSettings()
    let enabled = settings.enable

    if (enabled) {
        updateTerminalScheme(settings.style)
    }

    workspace.onDidChangeConfiguration((event) => {
        if (enabled && event.affectsConfiguration('terminal_themes.style')) {
            updateTerminalScheme(getSettings().style)
        }
    })
}

export function deactivate() { }
