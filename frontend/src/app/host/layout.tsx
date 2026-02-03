"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide layout for preview pages
  const isPreviewPage = pathname?.includes("/preview");

  if (isPreviewPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen flex-col dark:bg-secondary/30 bg-gray-500/10">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto rounded-tl-xl bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
