
'use client';
import Link from 'next/link';
import HamburgerButton from '../client/HamburgerButton';
import NotifButtonAndModal from '../client/NotifButtonModal';
import { useUser } from '../client/UserProvider';

export default function Header() {
  const user = useUser();
  return (
    <header className="header">
      <div className="header-left">
        <HamburgerButton />
        <nav className="breadcrumb">
          <Link href="#">Dashboard</Link>
          <span className="separator">
            <i className="fas fa-chevron-right" style={{ fontSize: '10px' }}></i>
          </span>
          <span className="current">Translation Overview</span>
        </nav>
      </div>

      <div className="header-right">
        <NotifButtonAndModal />
        <div className="profile-mini">
          <div className="avatar">{user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}</div>
          <span className="name">{user.username || user.email}</span>
        </div>
      </div>
    </header>
  );
}