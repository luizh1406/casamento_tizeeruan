"use client";
import { useEffect, useState } from "react";

const LINKS = [
  ["#presenca", "Confirmar presença"],
  ["#presentes", "Presentes"],
];

export default function Nav({ initials }: { initials: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || open;
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        solid ? "bg-ivory/92 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#topo" className={`h-display text-2xl tracking-wide transition-colors ${solid ? "text-ink" : "text-white"}`} aria-label="Início">
          {initials}
        </a>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className={`text-[0.7rem] uppercase tracking-[0.22em] transition-colors hover:text-gold ${solid ? "text-ink" : "text-white/90"}`}
            >
              {label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className={`flex h-11 w-11 items-center justify-center lg:hidden ${solid ? "text-ink" : "text-white"}`}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3 w-6">
            <span className={`absolute left-0 h-px w-6 bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-3 h-px w-6 bg-current transition-all ${open ? "top-1.5 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      {open && (
        <nav className="fade-in fixed inset-x-0 top-16 h-[calc(100dvh-4rem)] overflow-y-auto bg-ivory px-8 pb-10 pt-6 lg:hidden" aria-label="Menu móvel">
          <ul className="flex flex-col">
            {LINKS.map(([href, label]) => (
              <li key={href} className="border-b border-line">
                <a href={href} onClick={() => setOpen(false)} className="h-display block py-4 text-3xl text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
