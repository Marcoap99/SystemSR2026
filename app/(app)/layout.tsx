import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/layout/NavBar";
import { Container } from "@/components/layout/Container";
import { PageTransition } from "@/components/layout/PageTransition";
import { ThemeShaderBackground } from "@/components/layout/ThemeShaderBackground";

/**
 * Guard de sesión en el servidor (defensa en profundidad, además del
 * middleware): sin sesión no se renderiza nada de la app.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    // Sin bg-bg acá a propósito: un fondo sólido en este div pintaría
    // encima de su propio hijo con -z-10 (un z-index negativo empuja al
    // hijo detrás del fondo de SU padre, no solo detrás de los hermanos),
    // tapando el shader por completo. El body ya tiene bg-bg como fallback
    // (globals.css) para antes de que el canvas pinte o si JS falla.
    <div className="min-h-screen">
      <ThemeShaderBackground />
      <NavBar />
      <main className="py-6">
        <Container>
          <PageTransition>{children}</PageTransition>
        </Container>
      </main>
    </div>
  );
}
