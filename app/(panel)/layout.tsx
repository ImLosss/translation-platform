import SidebarProvider from "../components/client/SidebarProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* Semua halaman admin akan memiliki Sidebar */}
      {children}
    </SidebarProvider>
  );
}