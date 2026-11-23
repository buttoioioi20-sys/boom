# Milky Client

A Minecraft launcher with a Modrinth library, Fabric setup, skin closet, crosshair studio and module toggles.

## Run it
1. Install Node.js 20+ and Java 21
2. `npm install`
3. `npm start`

Installer: `npm run dist` (output in `dist/`).

## Status
- Launcher: sign-in, version picker, Fabric, pre-installed performance mods, Modrinth libraries, skins. Not fully tested.
- `ingame-mod/`: untested starting point. The crosshair, modules, HUD and custom main menu need it before they do anything in the game.

## Notes
- Not affiliated with Mojang or Microsoft. Minecraft is not included; the launcher downloads it from Mojang.
- Mods, packs and shaders come from Modrinth and belong to their authors.
- Heading font: Pirata One (SIL Open Font License) via @fontsource.
- Background videos are made from images you must have the right to share. Replace `renderer/bg*.webm`, `bg*-still.png` and `bg*-th.jpg` with your own before publishing.
