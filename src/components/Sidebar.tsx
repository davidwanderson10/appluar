"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/pedidos", label: "Pedidos", icon: "📋" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/produtos", label: "Produtos", icon: "📦" },
  { href: "/orcamentos", label: "Orçamentos", icon: "🧾" },
  { href: "/despesas", label: "Despesas", icon: "💸" },
  { href: "/estoque", label: "Estoque", icon: "🧵" },
  { href: "/calculadora", label: "Calculadora", icon: "🧮" },
  { href: "/configuracoes", label: "Configurações", icon: "⚙️" },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-accent text-white" : "text-muted hover:bg-border/40 hover:text-text"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      {/* Barra superior mobile */}
      <div className="flex items-center justify-between border-b border-border bg-panel px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Image src="/logo-badge.png" alt="Luar Print" width={28} height={28} className="rounded-full" />
          <span className="text-base font-semibold tracking-tight text-text">Luar Print</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text"
        >
          <span className="text-lg leading-none">☰</span>
        </button>
      </div>

      {/* Menu off-canvas mobile */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-panel">
            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-2">
                <Image src="/logo-badge.png" alt="Luar Print" width={32} height={32} className="rounded-full" />
                <span className="text-lg font-semibold tracking-tight text-text">Luar Print</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-border/40 hover:text-text"
              >
                ✕
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Sidebar fixa desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-panel md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <Image src="/logo-badge.png" alt="Luar Print" width={32} height={32} className="rounded-full" />
          <span className="text-lg font-semibold tracking-tight text-text">Luar Print</span>
        </div>
        <NavLinks pathname={pathname} />
      </aside>
    </>
  );
}
