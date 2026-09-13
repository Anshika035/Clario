import { type ReactNode } from "react";
import {
  AppMobileNav,
  AppSidebar,
  AppTopBar,
} from "@/components/layout/app-nav";
import { requireUser } from "@/lib/auth/server";

export default async function AppShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser();

  return (
    <div className="min-h-dvh bg-paper">
      <AppSidebar />
      <div className="lg:pl-64">
        <AppTopBar />
        <main className="px-4 py-8 pb-24 lg:px-8 lg:pb-10">{children}</main>
      </div>
      <AppMobileNav />
    </div>
  );
}
