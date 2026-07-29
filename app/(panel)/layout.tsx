import { redirect } from "next/dist/client/components/redirect";
import SidebarProvider from "../components/client/SidebarProvider";
import { getCurrentUser } from "../lib/auth";
import { UserProvider } from "../components/client/UserProvider";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <SidebarProvider>
      <UserProvider user={user}>
        {children}
      </UserProvider>
    </SidebarProvider>
  );
}