"use client";
import { useEffect, useState } from "react";

function parts(target: number, now: number) {
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor(diff / 3_600_000) % 24,
    m: Math.floor(diff / 60_000) % 60,
    s: Math.floor(diff / 1000) % 60,
    over: diff === 0,
  };
}

export default function Countdown({ target }: { target: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const p = now === null ? null : parts(target, now);
  if (p?.over) {
    return <p className="h-display text-3xl text-white md:text-4xl">Hoje é o grande dia ❤️</p>;
  }
  const items: [string, number | null][] = [
    ["Dias", p?.d ?? null],
    ["Horas", p?.h ?? null],
    ["Minutos", p?.m ?? null],
    ["Segundos", p?.s ?? null],
  ];
  return (
    <div className="flex items-start justify-center gap-1.5 sm:gap-8" role="timer" aria-label="Contagem regressiva para o casamento">
      {items.map(([label, v], i) => (
        <div key={label} className="flex items-start gap-1.5 sm:gap-8">
          <div className="min-w-[3.3rem] text-center sm:min-w-[5rem]">
            <div className="h-display text-[2.15rem] leading-none tabular-nums text-white sm:text-6xl">
              <span key={v ?? "x"} className="tick">
                {v === null ? "--" : String(v).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-1 text-[0.62rem] uppercase tracking-[0.28em] text-white/75 sm:text-xs">{label}</div>
          </div>
          {i < items.length - 1 && <span className="h-display pt-0.5 text-2xl text-white/40 sm:text-5xl">|</span>}
        </div>
      ))}
    </div>
  );
}
