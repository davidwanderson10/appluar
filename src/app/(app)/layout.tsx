import { Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { ToastFromQuery } from "@/components/ToastFromQuery";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <ToastFromQuery />
      </Suspense>
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </ToastProvider>
  );
}
