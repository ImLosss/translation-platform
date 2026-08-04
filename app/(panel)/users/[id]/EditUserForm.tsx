'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAlert } from '@/app/components/ui/Alert';
import { updateUser } from '@/app/actions/users/UserAction';

export default function EditUserForm({ user }: { user: any }) {
  const router = useRouter();
  const { showAlert } = useAlert();
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username || '',
    role: user.role || 'USER',
    balance: user.balance || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Panggil Server Action
    const result = await updateUser(user.id, formData);
    
    setIsSaving(false);

    if (result.success) {
      showAlert('Data pengguna berhasil diperbarui!', 'success');
      router.push('/users'); // Kembali ke halaman tabel users
      // Tidak perlu router.refresh() karena revalidatePath di action sudah melakukannya
    } else {
      showAlert(result.message, 'error');
    }
  };

  return (
    <section className="card">
      <div className="card-header">
        <h2>
          <i className="fas fa-user-edit" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
          Edit User
        </h2>
        <Link href="/users" className="btn btn-outline btn-sm">
          <i className="fas fa-arrow-left"></i> Back
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label>Email (Read-Only)</label>
          <input type="email" className="form-control" value={user.email} disabled style={{ backgroundColor: 'var(--bg-main)' }} />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label>Username</label>
          <input 
            type="text" 
            className="form-control" 
            value={formData.username} 
            onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label>Role</label>
          <select 
            className="form-control" 
            value={formData.role} 
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '25px' }}>
          <label>Balance (IDR)</label>
          <input 
            type="number" 
            className="form-control" 
            value={formData.balance} 
            onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}