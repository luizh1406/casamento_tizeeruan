"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryItem } from "@/lib/types";

// Alturas alternadas criam a composição editorial (masonry) no desktop.
const SPANS = ["row-span-2", "row-span-1", "row-span-1", "row-span-2", "row-span-1", "row-span-2"];

export default function Gallery({ items }: { items: GalleryItem[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const close = useCallback(() => setIdx(null), []);
  const step = useCallback(
    (d: number) => setIdx((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [idx, close, step]);

  if (!items.length) return null;
  return (
    <>
      {/* Celular: carrossel com snap para toque. Desktop: grade editorial. */}
      <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {items.map((g, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className="photo-frame relative aspect-[3/4] w-[78%] shrink-0 snap-center overflow-hidden rounded-2xl"
            aria-label={`Ampliar foto ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.src} alt={g.alt} loading="lazy" decoding="async" className="parallax h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="mt-1 text-center text-xs uppercase tracking-[0.25em] text-muted md:hidden">Deslize e toque para ampliar</p>

      <div className="hidden auto-rows-[15rem] grid-cols-3 gap-4 md:grid lg:auto-rows-[18rem]">
        {items.map((g, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className={`photo-frame relative overflow-hidden rounded-2xl ${SPANS[i % SPANS.length]}`}
            aria-label={`Ampliar foto ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.src} alt={g.alt} loading="lazy" decoding="async" className="parallax h-full w-full object-cover" />
            <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 hover:bg-ink/10" />
          </button>
        ))}
      </div>

      {idx !== null && (
        <div
          className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={items[idx].src}
            alt={items[idx].alt}
            className="max-h-[88dvh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button type="button" onClick={close} className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center text-3xl text-white" aria-label="Fechar">
            ×
          </button>
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-4xl text-white/80 hover:text-white"
                aria-label="Foto anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-4xl text-white/80 hover:text-white"
                aria-label="Próxima foto"
              >
                ›
              </button>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs tracking-[0.3em] text-white/70">
                {idx + 1} / {items.length}
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
}
