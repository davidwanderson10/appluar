import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";

export function TopBar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-panel px-6 py-4">
      <h1 className="text-lg font-semibold text-text">{title}</h1>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
