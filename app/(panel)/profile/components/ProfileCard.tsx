'use client';

import Image from "next/image";
import { useLanguage } from "@/app/components/client/LanguageProvider";
import { formatCurrency } from "@/app/lib/i18n/format";

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
  const { t, intlLocale } = useLanguage();

  // Inisial dari username, fallback "??"
  const initials = user.username
    ? user.username
        .split(' ')
        .map((s) => s[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '??';

  const memberSince = new Date(user.createdAt).toLocaleDateString(intlLocale, {
    year: 'numeric',
    month: 'long',
  });

  const projectsCount = user._count?.translations ?? '-';
  const balanceFormatted = formatCurrency(user.balance, intlLocale);

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
        <div className="name">{user.username || t.profile.defaultUser}</div>
        <div className="role">
          {user.role === 'ADMIN' ? t.profile.roleAdmin : t.profile.roleTranslator}
        </div>
        <div className="details">
          <div className="detail-item">
            <strong>{t.profile.email}</strong>
            <br />
            {user.email}
          </div>
          <div className="detail-item">
            <strong>{t.profile.memberSince}</strong>
            <br />
            {memberSince}
          </div>
          <div className="detail-item">
            <strong>{t.profile.translations}</strong>
            <br />
            {projectsCount}
          </div>
          <div className="detail-item">
            <strong>{t.profile.balance}</strong>
            <br />
            {balanceFormatted}
          </div>
        </div>
      </div>
    </div>
  );
}