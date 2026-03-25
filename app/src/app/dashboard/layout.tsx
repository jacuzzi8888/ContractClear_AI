import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/dashboard/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen">
      <Navbar user={session.user} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-16">
        {children}
      </main>
    </div>
  );
}
