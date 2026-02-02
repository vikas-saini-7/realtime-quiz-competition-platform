import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col bg-gray-500/10">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto rounded-tl-xl bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
