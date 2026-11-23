package gg.milky;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.rendering.v1.HudRenderCallback;
import net.fabricmc.loader.api.FabricLoader;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.entity.Entity;
import net.minecraft.util.hit.EntityHitResult;
import net.minecraft.util.hit.HitResult;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Draws the crosshair designed in the Milky launcher.
 * Reads <profile>/config/milkyclient/crosshair.json (written by the launcher).
 * SKELETON: written against the Fabric API from memory and NOT compiled. Method and
 * class names change between Minecraft versions, so expect to adjust imports.
 * To hide the vanilla crosshair, add a mixin that cancels InGameHud#renderCrosshair.
 */
public class MilkyCrosshair implements ClientModInitializer {
    private static final int N = 11;
    private JsonObject cfg;
    private long lastLoad;

    @Override
    public void onInitializeClient() {
        HudRenderCallback.EVENT.register(this::render);
    }

    private void reload() {
        long now = System.currentTimeMillis();
        if (now - lastLoad < 1000) return;      // re-read once a second so edits apply live
        lastLoad = now;
        try {
            Path p = FabricLoader.getInstance().getConfigDir().resolve("milkyclient/crosshair.json");
            if (Files.exists(p)) cfg = new Gson().fromJson(Files.readString(p), JsonObject.class);
        } catch (Exception ignored) {}
    }

    private void render(DrawContext ctx, Object tickCounter) {
        reload();
        MinecraftClient mc = MinecraftClient.getInstance();
        if (cfg == null || mc.options.hudHidden || mc.currentScreen != null) return;

        var grid = cfg.getAsJsonArray("grid");
        int scale = cfg.get("scale").getAsInt();
        boolean outline = cfg.get("outline").getAsBoolean();
        String mode = cfg.get("colorMode").getAsString();
        boolean targeting = mc.crosshairTarget != null
                && mc.crosshairTarget.getType() == HitResult.Type.ENTITY;
        int alpha = (int) (cfg.get("opacity").getAsInt() * 2.55);

        int color = mode.equals("dynamic") && targeting
                ? parse(cfg.get("targetColor").getAsString(), alpha)
                : mode.equals("blend") ? 0xFFFFFFFF : parse(cfg.get("color").getAsString(), alpha);
        int ol = parse(cfg.get("outlineColor").getAsString(), alpha);

        int px = Math.max(1, scale);                         // one design pixel = scale GUI pixels
        int x0 = ctx.getScaledWindowWidth() / 2 - N * px / 2;
        int y0 = ctx.getScaledWindowHeight() / 2 - N * px / 2;

        if (outline) {
            for (int i = 0; i < grid.size(); i++) {
                if (grid.get(i).getAsInt() == 0) continue;
                for (int dx = -1; dx <= 1; dx++)
                    for (int dy = -1; dy <= 1; dy++)
                        fill(ctx, x0, y0, i % N + dx, i / N + dy, px, ol);
            }
        }
        for (int i = 0; i < grid.size(); i++)
            if (grid.get(i).getAsInt() != 0) fill(ctx, x0, y0, i % N, i / N, px, color);
    }

    private void fill(DrawContext ctx, int x0, int y0, int cx, int cy, int px, int argb) {
        int x = x0 + cx * px, y = y0 + cy * px;
        ctx.fill(x, y, x + px, y + px, argb);
    }

    private static int parse(String hex, int alpha) {
        return (alpha << 24) | (Integer.parseInt(hex.substring(1), 16) & 0xFFFFFF);
    }
}
