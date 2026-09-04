"use client";

import { useState, useTransition } from "react";
import { saveDuolingoUsernameAction } from "@/lib/actions/duolingo";

/**
 * V1.7 — conectar el username público de Duolingo a daily_english. Vive
 * solo en la tarjeta de daily_english (StreakCard), es lo único a lo que
 * afecta. Sin contraseña ni login: la API pública de perfil de Duolingo
 * alcanza con el username.
 */
export function DuolingoConnect({ username }: { username: string | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(username ?? "");
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return username ? (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs text-text-muted underline decoration-dotted hover:text-text"
      >
        🦉 Conectado a Duolingo como <span className="font-mono">{username}</span>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs text-text-muted underline decoration-dotted hover:text-text"
      >
        🦉 Conectar Duolingo
      </button>
    );
  }

  function save(next: string | null) {
    startTransition(() => saveDuolingoUsernameAction(next));
    setEditing(false);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(value);
      }}
      className="flex items-center gap-1.5"
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="tu username de Duolingo"
        className="w-40 rounded-card border border-border px-2 py-1 text-xs text-text outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={pending || value.trim() === ""}
        className="rounded-card bg-brand px-2 py-1 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-60"
      >
        Guardar
      </button>
      {username ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => save(null)}
          className="text-xs text-text-muted hover:text-text"
        >
          Desconectar
        </button>
      ) : null}
      <button type="button" onClick={() => setEditing(false)} className="text-xs text-text-muted hover:text-text">
        Cancelar
      </button>
    </form>
  );
}
