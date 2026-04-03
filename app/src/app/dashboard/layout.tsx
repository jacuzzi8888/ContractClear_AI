import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/dashboard/navbar";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { getSessionFromCookie } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();
  const localSession = await getSessionFromCookie();

  if (!session && !localSession) {
    redirect("/login");
  }

  const user = session?.user || (localSession ? { email: localSession.email || undefined, sub: localSession.userId } : null);

  return (
    <DashboardWrapper>
      <div className="relative min-h-screen">
        <Navbar user={user} />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-16">
          {children}
        </main>
      </div>
    </DashboardWrapper>
  );
}
