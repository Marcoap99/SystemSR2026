"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const urlError = params.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("No se pudo iniciar con Google.");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6 shadow-card">
        <h1 className="text-xl font-semibold text-text">Plataforma de Desarrollo</h1>
        <p className="mt-1 text-sm text-text-muted">Acceso privado.</p>

        {urlError ? (
          <p className="mt-4 text-sm text-warn">
            {urlError === "denied" ? "Esta cuenta no tiene acceso." : "No se pudo completar el acceso."}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleGoogle}
          className="mt-6 w-full rounded-card bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Continuar con Google
        </button>

        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-text-muted">
            Acceso con contraseña (se retira cuando Google esté verificado)
          </summary>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-card border border-border bg-surface px-3 py-2 text-base text-text outline-none focus:border-brand"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-text">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-card border border-border bg-surface px-3 py-2 text-base text-text outline-none focus:border-brand"
            />
          </div>

          {error ? <p className="text-sm text-warn">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-card bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        </details>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
