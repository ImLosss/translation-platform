'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import HamburgerButton from '../client/HamburgerButton';
import NotifButtonAndModal from '../client/NotifButtonModal';
import { useUser } from '../client/UserProvider';

export default function Header() {
  const user = useUser();
  const pathname = usePathname(); // 🆕 ambil path saat ini

  // Fungsi untuk mengubah segmen path menjadi label yang rapi
  const formatSegment = (segment: string) =>
    segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  // Buat breadcrumb dari pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems =
  pathSegments.length === 0
    ? [{ label: "Dashboard", href: "/" }]
    : pathSegments.map((seg, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/");

        return {
          label: formatSegment(seg),
          href,
        };
      });

  return (
    <header className="header">
      <div className="header-left">
        <HamburgerButton />
        <nav className="breadcrumb">
          {breadcrumbItems.map((item, index) => (
            <span key={item.href}>
              {index < breadcrumbItems.length - 1 ? (
                <>
                  <Link href={item.href}>{item.label}</Link>
                  <span className="separator">
                    <i
                      className="fas fa-chevron-right"
                      style={{ fontSize: '10px' }}
                    ></i>
                  </span>
                </>
              ) : (
                <span className="current">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="header-right">
        <NotifButtonAndModal />
        <div className="profile-mini">
          <div className="avatar">
            {user.username?.charAt(0).toUpperCase() ||
              user.email.charAt(0).toUpperCase()}
          </div>
          <span className="name">{user.username || user.email}</span>
        </div>
      </div>
    </header>
  );
}