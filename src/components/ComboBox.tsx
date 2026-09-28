"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

export interface ComboBoxOption {
  value: string;
  label: string;
  hint?: string;
}

// Select com busca client-side. Usado para escolher cliente/produto entre dezenas ou centenas de cadastros.
export function ComboBox({
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  name,
  required,
}: {
  options: ComboBoxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <input type="hidden" name={name} value={value} required={required} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-left text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      >
        {selected ? selected.label : <span className="text-muted">{placeholder}</span>}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-panel shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full border-b border-border bg-transparent px-3 py-2 text-sm text-text focus:outline-none"
          />
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted">Nenhum resultado.</div>
            )}
            {filtered.map((o) => (
              <button
                type="button"
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-border/40",
                  o.value === value && "bg-accent/10 text-accent"
                )}
              >
                <span>{o.label}</span>
                {o.hint && <span className="text-xs text-muted">{o.hint}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
