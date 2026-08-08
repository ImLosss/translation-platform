import SidebarProvider from "../components/client/SidebarProvider";
import { getCurrentUser } from "../lib/auth";
import { UserProvider } from "../components/client/UserProvider";
import Header from "../components/layout/Header";
import "./panel.css";
import { redirect } from "next/navigation";
import ModalProvider from "../components/ui/ModalProvider";
import LoadingProvider from "../components/ui/LoadingProvider";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <UserProvider user={user}>
      <SidebarProvider user={user}>
          <ModalProvider>
            <LoadingProvider>
              <div className="main-wrapper">
                <Header />
                <main className="content">
                  {children}
                </main>
              </div>
            </LoadingProvider>
          </ModalProvider>
      </SidebarProvider>
    </UserProvider>
  );
}