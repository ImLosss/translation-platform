'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function LogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil nilai filter dari URL (jika sudah ada)
  const [method, setMethod] = useState(searchParams.get('method') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const handleFilter = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Reset ke halaman 1 setiap kali filter diterapkan
    params.set('page', '1'); 
    
    if (method) params.set('method', method);
    if (status) params.set('status', status);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    
    router.push(`/logs?${params.toString()}`);
  };

  const handleReset = () => {
    setMethod('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    router.push('/logs'); // Hapus semua query
  };

  return (
    <form onSubmit={handleFilter} style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="method">HTTP Method</label>
          <select 
            id="method" 
            className="form-control" 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="">Semua Method</option>
            <option value="GET">GET (Read)</option>
            <option value="POST">POST (Create)</option>
            <option value="PUT">PUT (Update)</option>
            <option value="DELETE">DELETE (Remove)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status Code</label>
          <select 
            id="status" 
            className="form-control" 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="success">Sukses (2xx)</option>
            <option value="error">Error (4xx & 5xx)</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input 
            type="date" 
            id="startDate" 
            className="form-control" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input 
            type="date" 
            id="endDate" 
            className="form-control" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '12px' }}>
        <button type="button" className="btn btn-outline btn-sm" onClick={handleReset}>
          <i className="fas fa-undo"></i> Reset
        </button>
        <button type="submit" className="btn btn-primary btn-sm">
          <i className="fas fa-filter"></i> Apply Filter
        </button>
      </div>
    </form>
  );
}