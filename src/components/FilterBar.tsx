import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";

export interface FilterField {
  name: string;
  label: string;
  type?: "date" | "text";
  options?: { value: string; label: string }[];
}

// Filtro simples via GET (sem JS): cada campo vira ?nome=valor na URL, lido pelo Server Component da página.
export function FilterBar({
  action,
  fields,
  values,
}: {
  action: string;
  fields: FilterField[];
  values: Record<string, string | undefined>;
}) {
  return (
    <form action={action} method="get" className="mb-5 flex flex-wrap items-end gap-3">
      {fields.map((field) => (
        <div key={field.name} className="min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-muted">{field.label}</label>
          {field.options ? (
            <Select name={field.name} defaultValue={values[field.name] ?? ""}>
              <option value="">Todos</option>
              {field.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          ) : (
            <Input type={field.type ?? "text"} name={field.name} defaultValue={values[field.name] ?? ""} />
          )}
        </div>
      ))}
      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
      <a href={action} className="text-sm text-muted underline underline-offset-2 hover:text-text">
        Limpar
      </a>
    </form>
  );
}
