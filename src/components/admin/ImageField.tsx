"use client";
import { useState } from "react";

/** Reduz a foto no aparelho antes de enviar (fotos de celular passam de 4 MB, limite do servidor). */
async function shrink(file: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
    return blob ? new File([blob], "foto.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export default function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File, reset: () => void) {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", await shrink(file));
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setError(d.error ?? "Falha no envio.");
      else onChange(d.url);
    } catch {
      setError("Falha no envio.");
    } finally {
      setBusy(false);
      reset();
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-sand">
          {value && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input className="input !min-h-10 !py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} placeholder="URL da imagem ou envie um arquivo" />
          <div>
            <div className={`relative inline-block ${busy ? "opacity-60" : ""}`}>
              <span className="btn btn-ghost btn-sm !min-h-9">{busy ? "Enviando…" : "Enviar foto"}</span>
              <input
                type="file"
                accept="image/*"
                aria-label="Enviar foto"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                disabled={busy}
                onChange={(e) => {
                  const el = e.currentTarget;
                  const file = el.files?.[0];
                  if (file) upload(file, () => { el.value = ""; });
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {error && <p className="err">{error}</p>}
    </div>
  );
}
