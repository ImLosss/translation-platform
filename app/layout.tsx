import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { AlertProvider } from "./components/ui/Alert";
import SidebarProvider from "./components/client/SidebarProvider";

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Admin · Translation Platform',
  description: 'Translation Platform Admin Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        {/* Font Awesome CDN */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body>
        <AlertProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
