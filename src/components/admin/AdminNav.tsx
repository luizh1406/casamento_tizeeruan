"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  ["/admin", "Dashboard"],
  ["/admin/convidados", "Convidados"],
  ["/admin/presentes", "Presentes"],
  ["/admin/recebidos", "Recebidos"],
  ["/admin/configuracoes", "Configurações"],
];

export default function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 md:px-6">
        <span className="h-display hidden py-3 text-2xl md:block">Painel</span>
        <nav className="flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none]" aria-label="Painel">
          {ITEMS.map(([href, label]) => {
            const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap px-3 py-4 text-[0.72rem] uppercase tracking-[0.18em] ${active ? "border-b-2 border-gold text-ink" : "text-muted hover:text-ink"}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <Link href="/" target="_blank" className="hidden text-xs uppercase tracking-[0.18em] text-muted hover:text-ink sm:block">Ver site</Link>
        <button onClick={logout} className="text-xs uppercase tracking-[0.18em] text-gold-dark">Sair</button>
      </div>
    </header>
  );
}
