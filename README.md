# Vscode Terminal Themes

change terminal theme dependently from the main editor with ease.

- all the schemes are based off https://github.com/Glitchbone/vscode-base16-term
- for live preview check https://glitchbone.github.io/vscode-base16-term

## # Add Your Own

- fork the repo
- add your theme(s) "check other themes files for format"
    - for single theme, open `themes/misc.json` and add your theme.
    - for multiple themes, create a new file `themes/xxx.json` and add your themes.
- open `package.json` and add your name under `authors` & the theme(s) names under `"terminal_themes.style"[enum]`

## # Known Issues

previewing themes from the quickpick too quickly might cause some issues with the running extensions that listen to the settings changes globally.
