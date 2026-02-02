import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col dark:bg-secondary/30 bg-black/10">
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
