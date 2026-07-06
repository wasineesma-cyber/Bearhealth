// ── Domain types for the multi-shop card / goods store ──
// Hierarchy:  Shop (ร้านย่อย)  →  Category (หมวดหมู่)  →  Product (สินค้า)

export interface Shop {
  id: string;
  slug: string;             // url-safe key, e.g. "phra-mae"
  name: string;             // e.g. "ร้านไพ่พระแม่"
  description: string;
  promptpayId: string;      // this shop's PromptPay phone / national id / e-wallet id
  promptpayName: string;    // account holder name shown to customer
  shippingNote: string;     // free text shown at checkout
  active: boolean;
  order: number;            // display order
  createdAt: string;
}

export interface Category {
  id: string;
  shopId: string;
  name: string;             // e.g. "ไพ่พระแม่", "กำยาน"
  order: number;
}

export interface Product {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;            // THB
  stock: number;
  image: string;            // media filename served via /api/media/<file>, or "" for placeholder
  active: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;             // snapshot at purchase time
  price: number;            // snapshot
  qty: number;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export interface Order {
  id: string;
  code: string;             // short human code e.g. "BC-8F3A"
  shopId: string;
  shopName: string;         // snapshot
  customerName: string;
  phone: string;
  address: string;
  note: string;
  items: OrderItem[];
  total: number;
  slip: string;             // media filename of payment slip
  status: OrderStatus;
  createdAt: string;
}

export interface Settings {
  siteName: string;         // overall brand shown on the landing page
  siteTagline: string;
}
