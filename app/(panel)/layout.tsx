import { redirect } from "next/dist/client/components/redirect";
import SidebarProvider from "../components/client/SidebarProvider";
import { getCurrentUser } from "../lib/auth";
import { UserProvider } from "../components/client/UserProvider";
import Header from "../components/layout/Header";
import "./panel.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <UserProvider user={user}>
      <SidebarProvider user={user}>
          <div className="main-wrapper">
            <Header />
            <main className="content">
              {children}
            </main>
          </div>
      </SidebarProvider>
    </UserProvider>
  );
}