// Client-safe formatting helpers (no server imports).

export function baht(n: number): string {
  return "฿" + new Intl.NumberFormat("th-TH").format(Math.round(n));
}

export function mediaUrl(name: string): string {
  return name ? `/api/media/${name}` : "";
}

export const STATUS_TH: Record<string, string> = {
  pending: "รอตรวจสอบ",
  paid: "ชำระแล้ว",
  shipped: "จัดส่งแล้ว",
  cancelled: "ยกเลิก",
};
