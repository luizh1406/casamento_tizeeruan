import QRCode from "qrcode";
import { randomBytes } from "node:crypto";

function tlv(id: string, value: string): string {
  return id + String(value.length).padStart(2, "0") + value;
}

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function clean(s: string, max: number): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "").trim().slice(0, max).toUpperCase();
}

export function newTxid(): string {
  // 25 caracteres alfanuméricos (limite do BR Code estático)
  return randomBytes(13).toString("hex").toUpperCase().slice(0, 25);
}

export interface PixParams { key: string; receiverName: string; city: string; amountCents: number; txid: string }

/** Gera o "Pix Copia e Cola" (BR Code estático) conforme o manual do Banco Central. */
export function buildPixPayload(p: PixParams): string {
  const amount = (p.amountCents / 100).toFixed(2);
  const merchantInfo = tlv("00", "br.gov.bcb.pix") + tlv("01", p.key.trim());
  const body =
    tlv("00", "01") +
    tlv("26", merchantInfo) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", amount) +
    tlv("58", "BR") +
    tlv("59", clean(p.receiverName, 25) || "NOIVOS") +
    tlv("60", clean(p.city, 15) || "BRASIL") +
    tlv("62", tlv("05", p.txid));
  const withCrcId = body + "6304";
  return withCrcId + crc16(withCrcId);
}

export async function payloadToQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, { errorCorrectionLevel: "M", margin: 1, width: 360, color: { dark: "#1f1a17", light: "#ffffff" } });
}
