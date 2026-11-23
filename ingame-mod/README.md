# Milky in-game mod (skeleton)
The launcher writes your settings to `<profile>/config/milkyclient/crosshair.json` and `modules.json`.
This mod reads them. Use the official Fabric example mod template for your Minecraft version, drop
`MilkyCrosshair.java` in, and register it as a client entrypoint in `fabric.mod.json`.
Not compiled or tested. Module toggles (modules.json) are not read by any code yet.
