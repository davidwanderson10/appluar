import { redirect } from "next/navigation";

// Redireciona carregando uma mensagem de sucesso/erro na querystring (?toast=...), lida e
// exibida pelo <ToastFromQuery/> montado no layout. Usado ao final de toda action que muda dado.
export function redirectWithToast(path: string, message: string, type: "success" | "error" = "success"): never {
  const params = new URLSearchParams();
  params.set("toast", message);
  if (type === "error") params.set("toastType", "error");
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${params.toString()}`);
}
