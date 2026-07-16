import type { FilmPreset } from "./filmPresets";

// ── Bake the full analog look onto a 2D canvas ──
// Layers, in order: base grade → color tint → halation glow → grain →
// light leak → vignette → optional date stamp.

interface RenderOpts {
  preset: FilmPreset;
  /** show retro orange date stamp bottom-right */
  dateStamp: boolean;
  /** mirror horizontally (front camera) */
  mirror: boolean;
}

function makeGrain(w: number, h: number, intensity: number): HTMLCanvasElement {
  // low-res noise, scaled up when drawn — cheaper and chunkier, like real grain
  const scale = 0.5;
  const gw = Math.max(1, Math.round(w * scale));
  const gh = Math.max(1, Math.round(h * scale));
  const c = document.createElement("canvas");
  c.width = gw;
  c.height = gh;
  const gx = c.getContext("2d")!;
  const img = gx.createImageData(gw, gh);
  const d = img.data;
  const amp = 255 * intensity;
  for (let i = 0; i < d.length; i += 4) {
    // monochrome speckle centered on mid-grey
    const n = 128 + (Math.random() - 0.5) * amp;
    d[i] = d[i + 1] = d[i + 2] = n;
    d[i + 3] = 255;
  }
  gx.putImageData(img, 0, 0);
  return c;
}

/**
 * Draw a source (video/image) plus the full film treatment onto `canvas`,
 * sized to the given width/height (which should match the source aspect).
 */
export function renderFilm(
  canvas: HTMLCanvasElement,
  source: CanvasImageSource,
  sw: number,
  sh: number,
  { preset, dateStamp, mirror }: RenderOpts,
): void {
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d")!;

  // 1 — base color grade
  ctx.save();
  ctx.filter = preset.filter === "none" ? "none" : preset.filter;
  if (mirror) {
    ctx.translate(sw, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, 0, 0, sw, sh);
  ctx.restore();

  // 2 — fade: lift the blacks toward a warm tone (matte faded-film look)
  if (preset.fade) {
    ctx.save();
    ctx.globalAlpha = preset.fade.alpha;
    ctx.globalCompositeOperation = "lighten";
    ctx.fillStyle = preset.fade.color;
    ctx.fillRect(0, 0, sw, sh);
    ctx.restore();
  }

  // 3 — flat color tint (warm highlights)
  if (preset.tint) {
    ctx.save();
    ctx.globalAlpha = preset.tint.alpha;
    ctx.globalCompositeOperation = preset.tint.mode as GlobalCompositeOperation;
    ctx.fillStyle = preset.tint.color;
    ctx.fillRect(0, 0, sw, sh);
    ctx.restore();
  }

  // 3 — halation: blurred bright red-orange glow bloomed from highlights
  if (preset.halation) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.35;
    ctx.filter = "blur(12px) brightness(1.4) saturate(1.6) sepia(0.4) hue-rotate(-20deg)";
    if (mirror) {
      ctx.translate(sw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(source, 0, 0, sw, sh);
    ctx.restore();
  }

  // 4 — grain
  if (preset.grain > 0) {
    const grain = makeGrain(sw, sh, preset.grain);
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = Math.min(1, preset.grain * 2.2);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(grain, 0, 0, sw, sh);
    ctx.restore();
  }

  // 5 — light leak from top-right corner
  if (preset.leak) {
    const g = ctx.createRadialGradient(sw * 0.92, sh * 0.08, 0, sw * 0.92, sh * 0.08, Math.max(sw, sh) * 0.7);
    g.addColorStop(0, preset.leak);
    g.addColorStop(0.4, `${preset.leak}55`);
    g.addColorStop(1, "transparent");
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, sw, sh);
    ctx.restore();
  }

  // 6 — vignette
  if (preset.vignette > 0) {
    const g = ctx.createRadialGradient(
      sw / 2, sh / 2, Math.min(sw, sh) * 0.3,
      sw / 2, sh / 2, Math.max(sw, sh) * 0.72,
    );
    g.addColorStop(0, "transparent");
    g.addColorStop(1, `rgba(0,0,0,${preset.vignette})`);
    ctx.save();
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, sw, sh);
    ctx.restore();
  }

  // 7 — retro date stamp
  if (dateStamp) {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const stamp = `'${yy} ${mm} ${dd}`;
    const size = Math.round(sh * 0.042);
    ctx.save();
    ctx.font = `700 ${size}px "Courier New", monospace`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.shadowColor = "rgba(255,140,0,0.9)";
    ctx.shadowBlur = size * 0.5;
    ctx.fillStyle = "#ff8c1a";
    ctx.fillText(stamp, sw - size * 0.9, sh - size * 0.9);
    ctx.restore();
  }
}
