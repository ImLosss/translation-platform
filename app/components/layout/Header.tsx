
import Link from 'next/link';
import HamburgerButton from '../client/HamburgerButton';
import NotifButtonAndModal from '../client/NotifButtonModal';

export default function Header() {
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
          <div className="avatar">JD</div>
          <span className="name">John Doe</span>
        </div>
      </div>
    </header>
  );
}