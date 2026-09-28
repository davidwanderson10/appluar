import Image from "next/image";
import { login } from "./actions";
import { Input, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo-badge.png" alt="Luar Print" width={64} height={64} className="mb-3 rounded-full" priority />
          <h1 className="text-lg font-semibold text-text">Luar Print</h1>
          <p className="text-sm text-muted">Entre para acessar o painel de gestão</p>
        </div>

        {params.error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            Não foi possível entrar. Verifique o e-mail e a senha.
          </div>
        )}

        <form action={login}>
          <input type="hidden" name="redirect" value={params.redirect ?? "/dashboard"} />
          <FieldGroup>
            <Label htmlFor="email" required>
              E-mail
            </Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="password" required>
              Senha
            </Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </FieldGroup>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </Card>
    </main>
  );
}
