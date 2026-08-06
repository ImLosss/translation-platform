'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { useAlert } from '../ui/Alert';
import { logoutAction } from '@/app/actions/logout';
import { usePathname, useRouter } from 'next/navigation';
import { CurrentUser } from './UserProvider';

// Definisikan tipe untuk context
interface SidebarContextType {
  isOpen: boolean;
  toggle: (force?: boolean) => void; // parameter opsional
}

// Buat context dengan nilai default yang sesuai tipe
const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => { },
});

export const useSidebar = () => useContext(SidebarContext);

export default function SidebarProvider({ children, user }: { children: ReactNode; user: CurrentUser }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { showAlert } = useAlert();

  const router = useRouter();
  const pathname = usePathname();


  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  async function logout() {
    await logoutAction();

    router.replace("/login");
    router.refresh();
  }

  const toggle = useCallback((force?: boolean) => {
    setIsOpen((prev) => (force !== undefined ? force : !prev));
  }, []);

  // Tutup dengan Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Tutup saat resize ke lebar desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 820 && isOpen) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const closeSidebar = () => {
      setIsOpen(false);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {/* Overlay hanya tampil saat sidebar terbuka */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon">
            <i className="fas fa-language"></i>
          </div>
          <div>
            <h1>Subnova</h1>
            <span>Translation Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Main</div>
          <Link href="/" className={isActive('/') ? 'active' : ''} onClick={closeSidebar}>
            <i className="fas fa-th-large"></i> Dashboard
          </Link>
          <Link href="/translate" className={isActive('/translate') ? 'active' : ''} onClick={closeSidebar}>
            <i className="fas fa-film"></i> Translations
          </Link>
          <Link href="/glosary" className={isActive('/glosary') ? 'active' : ''} onClick={closeSidebar}>
            <i className="fas fa-file-alt"></i> Glosary
          </Link>

          <div className="nav-label" style={{ marginTop: 12 }}>
            Management
          </div>
          <Link href="/billing" className={isActive('/billing') ? 'active' : ''} onClick={closeSidebar}>
            <i className="fas fa-credit-card"></i> Billing
            <span className="badge">Pro</span>
          </Link>
          <Link href="/profile" className={isActive('/profile') ? 'active' : ''} onClick={closeSidebar}>
            <i className="fas fa-user"></i> Profile
          </Link>
          {user?.role === 'ADMIN' && (
            <>
              <Link href="/users" className={isActive('/users') ? 'active' : ''} onClick={closeSidebar}>
                <i className="fas fa-users"></i> Users
              </Link>
              <Link href="/providers" className={isActive('/providers') ? 'active' : ''} onClick={closeSidebar}>
                <i className="fas fa-server"></i> Provider
              </Link>
              <Link href="/logs" className={isActive('/logs') ? 'active' : ''} onClick={closeSidebar}>
                <i className="fas fa-history"></i> Logs
              </Link>
              <Link href="/settings" className={isActive('/settings') ? 'active' : ''} onClick={closeSidebar}>
                <i className="fas fa-cog"></i> Settings
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" id="logoutBtn" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {children}
    </SidebarContext.Provider>
  );
}