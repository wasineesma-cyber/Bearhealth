// ── Film-stock presets ──
// Each preset emulates a classic analog film look. `filter` is a CSS/canvas
// filter string used for both the live viewfinder and the baked capture.
// `tint`, `grain`, `vignette`, `leak` and `halation` layer extra analog
// character on top of the base color grade.

export type BlendMode =
  | "multiply"
  | "screen"
  | "overlay"
  | "soft-light"
  | "color"
  | "lighten";

export interface FilmPreset {
  id: string;
  name: string;
  /** short vibe description */
  vibe: string;
  /** css filter string (video preview + canvas ctx.filter) */
  filter: string;
  /** flat color wash over the frame (warm highlights, soft-light) */
  tint?: { color: string; alpha: number; mode: BlendMode };
  /** lifts the blacks toward a warm tone — the matte "faded film" look */
  fade?: { color: string; alpha: number };
  /** film grain intensity 0..1 */
  grain: number;
  /** corner darkening 0..1 */
  vignette: number;
  /** optional light-leak gradient color (screen blended, top-right) */
  leak?: string;
  /** cinestill-style highlight halation glow */
  halation?: boolean;
  /** small swatch color for the picker chip */
  swatch: string;
}

export const FILM_PRESETS: FilmPreset[] = [
  // ── Flagship: the warm sun-drenched 35mm look from the reference photos.
  // Muted-but-glowing colors, warm golden highlights, lifted matte shadows.
  {
    id: "summer",
    name: "Summer 35",
    vibe: "แดดอุ่น ฟิล์มซัมเมอร์",
    filter: "saturate(1.08) contrast(0.98) brightness(1.04) sepia(0.16)",
    tint: { color: "#ffd7a0", alpha: 0.12, mode: "soft-light" },
    fade: { color: "#2b2118", alpha: 0.14 },
    grain: 0.1,
    vignette: 0.12,
    swatch: "#e9b878",
  },
  // Kodak Portra 400 — creamy skin tones, soft pastel, gentle warmth.
  {
    id: "portra400",
    name: "Portra 400",
    vibe: "ผิวครีม พาสเทลนุ่ม",
    filter: "saturate(1.04) contrast(0.97) brightness(1.05) sepia(0.1)",
    tint: { color: "#ffc29a", alpha: 0.1, mode: "soft-light" },
    fade: { color: "#241d16", alpha: 0.12 },
    grain: 0.11,
    vignette: 0.16,
    swatch: "#e7a76b",
  },
  // Cool ocean/ferry blues held against warm interior light.
  {
    id: "coastal",
    name: "Coastal",
    vibe: "ฟ้าเย็น น้ำทะเลใส",
    filter: "saturate(1.1) contrast(1.0) brightness(1.03) hue-rotate(-6deg)",
    tint: { color: "#7ec8e6", alpha: 0.08, mode: "soft-light" },
    fade: { color: "#1a2028", alpha: 0.12 },
    grain: 0.1,
    vignette: 0.18,
    swatch: "#6fb2cf",
  },
  {
    id: "gold200",
    name: "Kodak Gold",
    vibe: "เหลืองทองคลาสสิก",
    filter: "sepia(0.24) saturate(1.24) contrast(1.02) brightness(1.05)",
    tint: { color: "#ffcf59", alpha: 0.1, mode: "soft-light" },
    fade: { color: "#2a2012", alpha: 0.1 },
    grain: 0.14,
    vignette: 0.26,
    swatch: "#e8bd52",
  },
  {
    id: "cinestill800",
    name: "Cinestill 800T",
    vibe: "กลางคืน แสงฟุ้ง",
    filter: "saturate(1.12) contrast(1.12) hue-rotate(6deg) brightness(0.98)",
    tint: { color: "#4a7bff", alpha: 0.1, mode: "soft-light" },
    grain: 0.16,
    vignette: 0.36,
    halation: true,
    swatch: "#5a7de0",
  },
  {
    id: "hp5",
    name: "Ilford HP5",
    vibe: "ขาวดำ คอนทราสต์",
    filter: "grayscale(1) contrast(1.14) brightness(1.05)",
    fade: { color: "#1c1c1c", alpha: 0.1 },
    grain: 0.2,
    vignette: 0.3,
    swatch: "#cfcfcf",
  },
  {
    id: "vintage70",
    name: "Vintage '70s",
    vibe: "ซีเปีย จางย้อนยุค",
    filter: "sepia(0.45) saturate(1.08) contrast(0.94) brightness(1.08)",
    tint: { color: "#ffae52", alpha: 0.12, mode: "soft-light" },
    fade: { color: "#33220f", alpha: 0.16 },
    grain: 0.18,
    vignette: 0.4,
    leak: "#ff5e3a",
    swatch: "#d99a4e",
  },
  {
    id: "original",
    name: "Original",
    vibe: "ไม่ปรุงแต่ง",
    filter: "none",
    grain: 0,
    vignette: 0,
    swatch: "#8a8a8a",
  },
];

export const DEFAULT_PRESET_ID = "summer";
