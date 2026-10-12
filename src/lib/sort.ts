// Resolve o campo/direção de ordenação vindos da querystring contra uma lista de colunas permitidas,
// evitando passar um nome de coluna arbitrário pro Supabase.
export function resolveSort<T extends string>(
  sort: string | undefined,
  dir: string | undefined,
  allowed: readonly T[],
  fallback: T
): { field: T; ascending: boolean; dir: "asc" | "desc" } {
  const field = (allowed as readonly string[]).includes(sort ?? "") ? (sort as T) : fallback;
  const ascending = dir === "asc";
  return { field, ascending, dir: ascending ? "asc" : "desc" };
}
