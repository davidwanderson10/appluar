"use client";

import { useState, useTransition } from "react";
import { ComboBox } from "@/components/ComboBox";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createClienteQuick } from "@/app/(app)/clientes/actions";

const NOVO = "__novo__";

export function ClienteCombo({
  clientes,
  defaultValue = "",
}: {
  clientes: { id: number; nome: string }[];
  defaultValue?: string;
}) {
  const [lista, setLista] = useState(clientes);
  const [value, setValue] = useState(defaultValue);
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");
  const [pending, startTransition] = useTransition();

  function handleChange(v: string) {
    if (v === NOVO) {
      setErro("");
      setCriando(true);
      return;
    }
    setValue(v);
  }

  function salvarNovoCliente() {
    if (!nome.trim()) {
      setErro("Informe o nome do cliente");
      return;
    }
    setErro("");
    const formData = new FormData();
    formData.set("nome", nome);
    if (telefone) formData.set("telefone", telefone);

    startTransition(async () => {
      try {
        const novo = await createClienteQuick(formData);
        setLista((atual) => [...atual, novo].sort((a, b) => a.nome.localeCompare(b.nome)));
        setValue(String(novo.id));
        setCriando(false);
        setNome("");
        setTelefone("");
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao cadastrar cliente");
      }
    });
  }

  return (
    <div>
      <ComboBox
        name="cliente_id"
        required
        value={value}
        onChange={handleChange}
        placeholder="Buscar cliente..."
        options={[
          { value: NOVO, label: "+ Cadastrar novo cliente" },
          ...lista.map((c) => ({ value: String(c.id), label: c.nome })),
        ]}
      />
      {criando && (
        <div className="mt-2 space-y-2 rounded-lg border border-border bg-border/10 p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input placeholder="Nome do cliente" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
            <Input placeholder="Telefone (opcional)" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </div>
          {erro && <p className="text-xs text-red-500">{erro}</p>}
          <div className="flex gap-2">
            <Button type="button" onClick={salvarNovoCliente} disabled={pending}>
              {pending ? "Salvando..." : "Salvar cliente"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCriando(false);
                setErro("");
              }}
            >
              Cancelar
            </Button>
          </div>
          <p className="text-xs text-muted">
            Cadastro rápido — você pode completar endereço, documento e outros dados depois em Clientes.
          </p>
        </div>
      )}
    </div>
  );
}
