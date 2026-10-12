import Link from "next/link";

// Cabeçalho de coluna clicável para ordenar listas via querystring (?sort=campo&dir=asc|desc),
// preservando os demais filtros já aplicados na URL.
export function SortableHeader({
  label,
  field,
  action,
  params,
  align = "left",
}: {
  label: string;
  field: string;
  action: string;
  params: Record<string, string | undefined>;
  align?: "left" | "right";
}) {
  const currentSort = params.sort;
  const currentDir = params.dir === "asc" ? "asc" : "desc";
  const active = currentSort === field;
  const nextDir = active && currentDir === "asc" ? "desc" : "asc";

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "sort" && key !== "dir") qs.set(key, value);
  }
  qs.set("sort", field);
  qs.set("dir", nextDir);

  return (
    <Link
      href={`${action}?${qs.toString()}`}
      className={`inline-flex items-center gap-1 hover:text-text ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      {label}
      <span className={active ? "text-text" : "text-muted/60"}>{active ? (currentDir === "asc" ? "▲" : "▼") : "⇅"}</span>
    </Link>
  );
}
