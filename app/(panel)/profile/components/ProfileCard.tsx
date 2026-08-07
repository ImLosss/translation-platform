import Image from "next/image";

interface UserProfile {
  email: string;
  username: string | null;
  avatar: string | null;
  balance: number;
  role: string;
  createdAt: string;
  _count?: { translations: number };
}

export default function ProfileCard({ user }: { user: UserProfile }) {
  // Inisial dari username, fallback "??"
  const initials = user.username
    ? user.username
        .split(' ')
        .map((s) => s[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '??';

  const memberSince = new Date(user.createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
  });

  const projectsCount = user._count?.translations ?? '-';
  const balanceFormatted = user.balance.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
  });

  return (
    <div className="profile-card">
      <div className="profile-avatar">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.username ?? 'Avatar'}
            width={100}
            height={100}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          initials
        )}
      </div>
      <div className="profile-info">
        <div className="name">{user.username || 'Pengguna'}</div>
        <div className="role">
          {user.role === 'ADMIN' ? 'Administrator' : 'Translator'}
        </div>
        <div className="details">
          <div className="detail-item">
            <strong>Email</strong>
            <br />
            {user.email}
          </div>
          <div className="detail-item">
            <strong>Member Since</strong>
            <br />
            {memberSince}
          </div>
          <div className="detail-item">
            <strong>Translations</strong>
            <br />
            {projectsCount}
          </div>
          <div className="detail-item">
            <strong>Balance</strong>
            <br />
            {balanceFormatted}
          </div>
        </div>
      </div>
    </div>
  );
}