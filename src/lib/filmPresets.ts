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

export type PresetCategory = "camera" | "stock";

export interface FilmPreset {
  id: string;
  name: string;
  /** "camera" = emulates a famous camera; "stock" = a film emulsion */
  category: PresetCategory;
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
  /** cinestill-style red-orange highlight halation glow */
  halation?: boolean;
  /** soft dreamy highlight bloom (compact-camera lenses like the Olympus μ) */
  glow?: { color: string; alpha: number };
  /** small swatch color for the picker chip */
  swatch: string;
}

export const FILM_PRESETS: FilmPreset[] = [
  // ══ Famous cameras — each emulates a legendary camera's signature look ══
  {
    id: "contaxt2",
    name: "Contax T2",
    category: "camera",
    vibe: "ครีมอุ่น เลนส์ Zeiss",
    filter: "saturate(1.06) contrast(1.02) brightness(1.04) sepia(0.08)",
    tint: { color: "#ffe0b0", alpha: 0.1, mode: "soft-light" },
    fade: { color: "#241c14", alpha: 0.1 },
    glow: { color: "#fff4e2", alpha: 0.12 },
    grain: 0.09,
    vignette: 0.14,
    swatch: "#e8c48a",
  },
  {
    id: "leicam",
    name: "Leica M",
    category: "camera",
    vibe: "สีอิ่ม ดำลึก มีมิติ",
    filter: "saturate(1.14) contrast(1.1) brightness(1.0)",
    tint: { color: "#ffe8cc", alpha: 0.05, mode: "soft-light" },
    grain: 0.08,
    vignette: 0.2,
    swatch: "#cc2b2b",
  },
  {
    id: "olympusmju",
    name: "Olympus μ-II",
    category: "camera",
    vibe: "ฟุ้งฝัน นุ่มอุ่น",
    filter: "saturate(1.05) contrast(0.94) brightness(1.06) sepia(0.12)",
    tint: { color: "#ffd9a8", alpha: 0.12, mode: "soft-light" },
    fade: { color: "#2a2016", alpha: 0.14 },
    glow: { color: "#fff2df", alpha: 0.24 },
    grain: 0.12,
    vignette: 0.24,
    swatch: "#e0b98a",
  },
  {
    id: "yashicat4",
    name: "Yashica T4",
    category: "camera",
    vibe: "สีจัด คมชัด Tessar",
    filter: "saturate(1.3) contrast(1.14) brightness(1.0)",
    tint: { color: "#7ec8e6", alpha: 0.04, mode: "overlay" },
    grain: 0.12,
    vignette: 0.28,
    swatch: "#2f7fbf",
  },
  {
    id: "classicchrome",
    name: "Classic Chrome",
    category: "camera",
    vibe: "หม่นสารคดี Fuji",
    filter: "saturate(0.82) contrast(1.08) brightness(1.0) sepia(0.06)",
    tint: { color: "#3a4a5a", alpha: 0.07, mode: "soft-light" },
    fade: { color: "#20242a", alpha: 0.1 },
    grain: 0.1,
    vignette: 0.2,
    swatch: "#6b7785",
  },
  {
    id: "velvia",
    name: "Velvia 50",
    category: "camera",
    vibe: "สีสดจัดจ้าน แลนด์สเคป",
    filter: "saturate(1.5) contrast(1.16) brightness(1.0)",
    tint: { color: "#00d0a0", alpha: 0.04, mode: "overlay" },
    grain: 0.08,
    vignette: 0.26,
    swatch: "#12a15f",
  },
  {
    id: "polaroidsx70",
    name: "Polaroid SX-70",
    category: "camera",
    vibe: "ขุ่นนวล จางย้อนยุค",
    filter: "saturate(0.95) contrast(0.9) brightness(1.08) sepia(0.18) hue-rotate(-6deg)",
    tint: { color: "#d8e0b0", alpha: 0.12, mode: "soft-light" },
    fade: { color: "#2e2a1e", alpha: 0.2 },
    glow: { color: "#ffffff", alpha: 0.1 },
    grain: 0.1,
    vignette: 0.16,
    swatch: "#cfd0a0",
  },
  {
    id: "disposable",
    name: "Disposable",
    category: "camera",
    vibe: "กล้องใช้แล้วทิ้ง แฟลชแรง",
    filter: "saturate(1.2) contrast(1.18) brightness(1.02) hue-rotate(-12deg) sepia(0.1)",
    tint: { color: "#b8d84a", alpha: 0.06, mode: "overlay" },
    grain: 0.2,
    vignette: 0.42,
    swatch: "#a5c93e",
  },
  {
    id: "ccddigicam",
    name: "CCD Digicam",
    category: "camera",
    vibe: "ดิจิแคมยุค 2000",
    filter: "saturate(1.15) contrast(1.14) brightness(1.02) hue-rotate(4deg)",
    tint: { color: "#6aa8ff", alpha: 0.05, mode: "overlay" },
    grain: 0.06,
    vignette: 0.18,
    swatch: "#4f8fe0",
  },

  // ══ Film stocks ══
  // ── Flagship: the warm sun-drenched 35mm look from the reference photos.
  // Muted-but-glowing colors, warm golden highlights, lifted matte shadows.
  {
    id: "summer",
    name: "Summer 35",
    category: "stock",
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
    category: "stock",
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
    category: "stock",
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
    category: "stock",
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
    category: "stock",
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
    category: "stock",
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
    category: "stock",
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
    category: "stock",
    vibe: "ไม่ปรุงแต่ง",
    filter: "none",
    grain: 0,
    vignette: 0,
    swatch: "#8a8a8a",
  },
];

export const DEFAULT_PRESET_ID = "summer";
