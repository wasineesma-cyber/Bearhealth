import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { Shop, Category, Product, Order, Settings } from "./types";

// ── File-based data store (JSON on disk) ──
// NOTE: the runtime container is ephemeral. Data persists across requests
// within a running server but is reset when the container is rebuilt.
// For a small shop this is fine to start; swap to a DB later if needed.

const DATA_DIR = path.join(process.cwd(), "data");
const MEDIA_DIR = path.join(DATA_DIR, "media");

const FILES = {
  shops: path.join(DATA_DIR, "shops.json"),
  categories: path.join(DATA_DIR, "categories.json"),
  products: path.join(DATA_DIR, "products.json"),
  orders: path.join(DATA_DIR, "orders.json"),
  settings: path.join(DATA_DIR, "settings.json"),
};

async function ensureDirs() {
  await fs.mkdir(MEDIA_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await ensureDirs();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

export function uid(): string {
  return crypto.randomUUID();
}

export function orderCode(): string {
  return "BC-" + crypto.randomBytes(2).toString("hex").toUpperCase();
}

export function slugify(name: string): string {
  // ascii-only, url-safe slug; Thai-only names fall back to shop-xxxx
  const base = (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "shop-" + crypto.randomBytes(2).toString("hex");
}

// ── Seed defaults on first run ──
// Memoize the seeding promise so concurrent callers await the SAME run
// (otherwise a second caller could read a file before it's written).
let seedPromise: Promise<void> | null = null;
function seedIfEmpty(): Promise<void> {
  if (!seedPromise) seedPromise = doSeed();
  return seedPromise;
}

async function doSeed() {
  await ensureDirs();

  const shops = await readJson<Shop[] | null>(FILES.shops, null);
  if (!shops) {
    const shopId = uid();
    const defaultShop: Shop = {
      id: shopId,
      slug: "phra-mae",
      name: "ร้านไพ่พระแม่",
      description: "ไพ่พระแม่ ไพ่ทาโรต์ และเครื่องหอมมงคล",
      promptpayId: "",
      promptpayName: "",
      shippingNote: "จัดส่งภายใน 1-2 วันทำการหลังยืนยันการชำระเงิน",
      active: true,
      order: 0,
      createdAt: new Date().toISOString(),
    };
    await writeJson(FILES.shops, [defaultShop]);

    const cats: Category[] = [
      { id: uid(), shopId, name: "ไพ่พระแม่", order: 0 },
      { id: uid(), shopId, name: "ไพ่ทาโรต์/ออราเคิล", order: 1 },
      { id: uid(), shopId, name: "กำยาน & เครื่องหอม", order: 2 },
    ];
    await writeJson(FILES.categories, cats);

    const products: Product[] = [
      {
        id: uid(),
        shopId,
        categoryId: cats[0].id,
        name: "ไพ่พระแม่ (สำรับตัวอย่าง)",
        description: "สำรับไพ่พระแม่พร้อมคู่มือ — แก้ไข/ลบได้ในหน้าแอดมิน",
        price: 590,
        stock: 10,
        image: "",
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
    await writeJson(FILES.products, products);
  }

  const settings = await readJson<Settings | null>(FILES.settings, null);
  if (!settings) {
    await writeJson(FILES.settings, {
      siteName: "Bear Cards",
      siteTagline: "ไพ่พระแม่ · ไพ่ · กำยาน — เลือกร้านที่ต้องการด้านล่าง",
    } satisfies Settings);
  }

  const orders = await readJson<Order[] | null>(FILES.orders, null);
  if (!orders) await writeJson(FILES.orders, []);
}

// ── Shops ──
export async function getShops(): Promise<Shop[]> {
  await seedIfEmpty();
  const shops = await readJson<Shop[]>(FILES.shops, []);
  return shops.sort((a, b) => a.order - b.order);
}
export async function getShopBySlug(slug: string): Promise<Shop | undefined> {
  const shops = await getShops();
  return shops.find((s) => s.slug === slug);
}
export async function getShopById(id: string): Promise<Shop | undefined> {
  const shops = await getShops();
  return shops.find((s) => s.id === id);
}
export async function saveShops(shops: Shop[]) {
  await writeJson(FILES.shops, shops);
}

// ── Categories ──
export async function getCategories(): Promise<Category[]> {
  await seedIfEmpty();
  const cats = await readJson<Category[]>(FILES.categories, []);
  return cats.sort((a, b) => a.order - b.order);
}
export async function saveCategories(cats: Category[]) {
  await writeJson(FILES.categories, cats);
}

// ── Products ──
export async function getProducts(): Promise<Product[]> {
  await seedIfEmpty();
  return readJson<Product[]>(FILES.products, []);
}
export async function saveProducts(products: Product[]) {
  await writeJson(FILES.products, products);
}

// ── Orders ──
export async function getOrders(): Promise<Order[]> {
  await seedIfEmpty();
  const orders = await readJson<Order[]>(FILES.orders, []);
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function saveOrders(orders: Order[]) {
  await writeJson(FILES.orders, orders);
}

// ── Settings ──
export async function getSettings(): Promise<Settings> {
  await seedIfEmpty();
  return readJson<Settings>(FILES.settings, { siteName: "Bear Cards", siteTagline: "" });
}
export async function saveSettings(s: Settings) {
  await writeJson(FILES.settings, s);
}

// ── Media (product images + payment slips) ──
export async function saveMedia(buffer: Buffer, ext: string): Promise<string> {
  await ensureDirs();
  const safeExt = (ext || "bin").replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  const name = `${uid()}.${safeExt}`;
  await fs.writeFile(path.join(MEDIA_DIR, name), buffer);
  return name;
}

export async function readMedia(name: string): Promise<Buffer | null> {
  // prevent path traversal — only allow a bare filename
  if (!name || name.includes("/") || name.includes("\\") || name.includes("..")) {
    return null;
  }
  try {
    return await fs.readFile(path.join(MEDIA_DIR, name));
  } catch {
    return null;
  }
}

export function contentTypeFor(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "webp": return "image/webp";
    case "gif": return "image/gif";
    default: return "application/octet-stream";
  }
}
