import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/layout/NavBar";
import { Container } from "@/components/layout/Container";
import { PageTransition } from "@/components/layout/PageTransition";

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
    <div className="min-h-screen bg-bg">
      <NavBar />
      <main className="py-6">
        <Container>
          <PageTransition>{children}</PageTransition>
        </Container>
      </main>
    </div>
  );
}
