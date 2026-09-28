"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/pedidos", label: "Pedidos", icon: "📋" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/produtos", label: "Produtos", icon: "📦" },
  { href: "/orcamentos", label: "Orçamentos", icon: "🧾" },
  { href: "/estoque", label: "Estoque", icon: "🧵" },
  { href: "/calculadora", label: "Calculadora", icon: "🖨️" },
  { href: "/configuracoes", label: "Configurações", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-panel md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <Image src="/logo-badge.png" alt="Luar Print" width={32} height={32} className="rounded-full" />
        <span className="text-lg font-semibold tracking-tight text-text">Luar Print</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}
