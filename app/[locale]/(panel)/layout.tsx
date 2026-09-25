import SidebarProvider from "../../components/client/SidebarProvider";
import { getCurrentUser } from "../../lib/auth";
import { UserProvider } from "../../components/client/UserProvider";
import Header from "../../components/layout/Header";
import "./panel.css";
import { notFound, redirect } from "next/navigation";
import ModalProvider from "../../components/ui/ModalProvider";
import LoadingProvider from "../../components/ui/LoadingProvider";
import { LanguageProvider } from "../../components/client/LanguageProvider";
import { isLocale, localePath } from "../../lib/i18n/locales";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(localePath(locale, "/login"));

  return (
    <UserProvider user={user}>
      <LanguageProvider locale={locale}>
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
      </LanguageProvider>
    </UserProvider>
  );
}
