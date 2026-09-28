import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { ClienteForm } from "@/components/ClienteForm";
import { createCliente } from "../actions";

export default function NovoClientePage() {
  return (
    <div>
      <TopBar title="Novo Cliente" />
      <div className="p-6">
        <Card className="max-w-3xl">
          <ClienteForm action={createCliente} />
        </Card>
      </div>
    </div>
  );
}
