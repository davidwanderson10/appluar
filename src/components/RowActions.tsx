"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

export function RowActions({
  editHref,
  deleteAction,
  confirmText = "Tem certeza que deseja excluir?",
  className,
}: {
  editHref: string;
  deleteAction: (formData: FormData) => void;
  confirmText?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      <Link
        href={editHref}
        title="Editar"
        aria-label="Editar"
        className="rounded-lg p-1.5 text-muted hover:bg-border/40 hover:text-text"
      >
        ✏️
      </Link>
      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (!window.confirm(confirmText)) e.preventDefault();
        }}
      >
        <button
          type="submit"
          title="Excluir"
          aria-label="Excluir"
          className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-500"
        >
          🗑️
        </button>
      </form>
    </div>
  );
}
