"use client";
import { useRef, useState } from "react";

export default function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setError(d.error ?? "Falha no envio.");
      else onChange(d.url);
    } catch {
      setError("Falha no envio.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
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
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <button type="button" className="btn btn-ghost btn-sm !min-h-9" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? "Enviando…" : "Enviar foto"}
            </button>
          </div>
        </div>
      </div>
      {error && <p className="err">{error}</p>}
    </div>
  );
}
