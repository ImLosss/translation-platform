'use client';

import { useState } from 'react';
import EditProfileForm from './EditProfileForm';

interface UserProfile {
  // ... sesuaikan dengan interface di atas
  id: number;
  email: string;
  username: string | null;
  avatar: string | null;
  balance: number;
  role: string;
  createdAt: string;
  provider: string;
  _count?: { translations: number };
}

export default function ProfileContainer({
  user,
  children, // ProfileCard (server)
}: {
  user: UserProfile;
  children: React.ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <EditProfileForm
        user={user}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => setIsEditing(false)}
      />
    );
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>
          <i
            className="fas fa-user-circle"
            style={{ color: 'var(--accent)', marginRight: '10px' }}
          ></i>
          Profile
        </h2>
        <div className="card-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setIsEditing(true)}
          >
            <i className="fas fa-edit"></i> Edit
          </button>
        </div>
      </div>
      {children}
    </section>
  );
}