"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toast";

// Lê ?toast=mensagem (e opcionalmente &toastType=error) da URL, mostra a notificação e
// limpa esses parâmetros — assim a mensagem não reaparece num refresh ou "voltar" do navegador.
export function ToastFromQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const toast = searchParams.get("toast");
  const toastType = searchParams.get("toastType") === "error" ? "error" : "success";

  useEffect(() => {
    if (!toast) return;
    showToast(toast, toastType);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    params.delete("toastType");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  return null;
}
