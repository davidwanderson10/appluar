"use client";

import { useRef, useState } from "react";

// Campo de foto que aceita clique (seletor nativo), arrastar-e-soltar e colar (Ctrl+V).
// Sincroniza o arquivo escolhido por qualquer um desses caminhos no <input type="file">
// de verdade (via DataTransfer), pra o form continuar enviando normalmente no submit.
export function FotoDropInput({
  name = "foto",
  previewUrl,
  label,
}: {
  name?: string;
  previewUrl?: string | null;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(previewUrl ?? null);
  const [dragOver, setDragOver] = useState(false);

  function setFile(file: File | null) {
    const input = inputRef.current;
    if (!input) return;
    if (file) {
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      setPreview(URL.createObjectURL(file));
    } else {
      input.value = "";
      setPreview(previewUrl ?? null);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) setFile(file);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    const file = item?.getAsFile();
    if (file) setFile(file);
  }

  return (
    <div>
      {label && <label className="mb-1 block text-xs font-medium text-muted">{label}</label>}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
        className={`flex items-center gap-3 rounded-lg border p-2 outline-none ${
          dragOver ? "border-accent bg-accent/5" : "border-dashed border-border"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- preview pode ser blob: local, next/image não aceita */}
        <img
          src={preview ?? undefined}
          alt=""
          onClick={() => inputRef.current?.click()}
          className={`h-14 w-14 shrink-0 cursor-pointer rounded-lg border border-border object-cover ${preview ? "" : "hidden"}`}
        />
        {!preview && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-xl"
          >
            🖼️
          </button>
        )}
        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            name={name}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border file:border-border file:bg-panel file:px-3 file:py-1.5 file:text-xs file:text-text"
          />
          <p className="mt-1 text-[11px] text-muted">Clique, arraste um arquivo aqui ou cole (Ctrl+V) uma imagem.</p>
        </div>
      </div>
    </div>
  );
}
