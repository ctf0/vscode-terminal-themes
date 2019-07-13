# Vscode Terminal Themes

change terminal theme dependently from the main editor with ease.

- all the schemes are based off https://github.com/Glitchbone/vscode-base16-term
- for live preview check https://glitchbone.github.io/vscode-base16-term

## # Add Your Own

- fork the repo
- open `assets/theme.json` and add your theme(s).
- open `package.json` and add your name under `authors` & the theme(s) names under `"terminal_themes.style"[enum]`

## # Known Issues

previewing themes from the quickpick too quickly might cause some issues with the running extensions that listen to the settings changes globally.
