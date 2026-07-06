// ── PromptPay QR payload generator (EMVCo standard) ──
// Ported from the well-known promptpay-qr algorithm.

function sanitize(id: string): string {
  return (id || "").replace(/[^0-9]/g, "");
}

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function formatTarget(id: string): string {
  const numbers = sanitize(id);
  if (numbers.length >= 13) return numbers; // tax id / e-wallet id already full length
  // mobile: 0066 + number without leading 0, right-justified to 13 chars
  return ("0000000000000" + numbers.replace(/^0/, "66")).slice(-13);
}

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ((crc & 0xffff).toString(16).toUpperCase()).padStart(4, "0");
}

/**
 * Build a PromptPay EMVCo payload string.
 * @param target phone number / national id / e-wallet id
 * @param amount amount in THB (optional — omit for a static QR)
 */
export function promptPayPayload(target: string, amount?: number): string {
  const numbers = sanitize(target);
  const targetTag =
    numbers.length >= 15 ? "03" : numbers.length >= 13 ? "02" : "01";

  const merchant = tlv("29", tlv("00", "A000000677010111") + tlv(targetTag, formatTarget(target)));

  const parts = [
    tlv("00", "01"),                       // payload format indicator
    tlv("01", amount ? "12" : "11"),       // dynamic (with amount) vs static
    merchant,
    tlv("53", "764"),                      // currency THB
    amount ? tlv("54", amount.toFixed(2)) : "",
    tlv("58", "TH"),                       // country
  ];

  const data = parts.join("") + "6304"; // CRC tag + length placeholder
  return data + crc16(data);
}
