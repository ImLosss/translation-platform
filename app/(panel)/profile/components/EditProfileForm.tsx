'use client';

import { updateProfileAction } from '@/app/actions/profile/action';
import { useState, type FormEvent } from 'react';

interface UserProfile {
  username: string | null;
  email: string;
}

interface Props {
  user: UserProfile;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EditProfileForm({ user, onCancel, onSuccess }: Props) {
  const [username, setUsername] = useState(user.username ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || username.trim().length < 2) {
      setError('Username minimal 2 karakter.');
      return;
    }

    setLoading(true);
    try {
      const result = await updateProfileAction({ username: username.trim() });
      if (result.success) {
        setSuccessMsg(result.message);
        onSuccess();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>
          <i className="fas fa-user-edit" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
          Edit Profile
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={user.email}
            disabled
            readOnly
          />
          <small className="text-muted">Email tidak dapat diubah.</small>
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username baru"
            required
            minLength={2}
          />
        </div>

        {error && (
          <div className="alert error" style={{ marginBottom: '1rem' }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
        {successMsg && (
          <div className="alert success" style={{ marginBottom: '1rem' }}>
            <i className="fas fa-check-circle"></i> {successMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Menyimpan...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Simpan
              </>
            )}
          </button>
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
            Batal
          </button>
        </div>
      </form>
    </section>
  );
}