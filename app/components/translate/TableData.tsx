'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import EllipsisDropdown from "../client/ElipsisDropdown";
import ButtonGenerateGlosary from "./ButtonGenerateGlosary";
import { getTranslationsAction } from "@/app/actions/translate/getTranslationsAction";

export interface MetaPagination {
  total: number;
  page: number;
  lastPage: number;
}

export interface Translation {
  id: number;
  fileName: string;
  sourceLang: string;
  targetLang: string;

  status: "PROCESSING" | "TRANSCRIBING" | "COMPLETED" | "ERROR";
  progress: string;

  batchSize: number;

  glossaryId: number | null;
  glossary: {
    id: number;
    name: string;
  } | null;

  provider: {
    model: string;
  };

  totalCost: number;
  totalToken: number;

  videoSource: string | null;

  userId: number;

  createdAt: string;
  updatedAt: string;
}

const statusClass = {
  TRANSCRIBING: "info",
  PROCESSING: "warning",
  COMPLETED: "success",
  ERROR: "danger",
};

// ==============================
// 2. Client Component
// ==============================
export default function TableData() {
  const [jobs, setJobs] = useState<Translation[]>([]);
  const [meta, setMeta] = useState<MetaPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Fetch Data Awal & Pindah Halaman
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      setIsLoading(true);
      const result = await getTranslationsAction(currentPage);
      
      if (result.success && result.response && isMounted) {
        setJobs(result.response.data);
        setMeta(result.response.meta);
      }
      
      if (isMounted) setIsLoading(false);
    };

    fetchInitialData();

    return () => { isMounted = false; };
  }, [currentPage]);

  // 2. Logika Polling Data (Otomatis & Aman)
  useEffect(() => {
    if (isLoading) return;

    const hasPendingJobs = jobs.some(
      (job) => job.status === "PROCESSING" || job.status === "TRANSCRIBING"
    );

    if (!hasPendingJobs) return;

    const timer = setTimeout(async () => {
      const result = await getTranslationsAction(currentPage);
      if (result.success && result.response) {
        setJobs(result.response.data);
        setMeta(result.response.meta);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [jobs, isLoading, currentPage]);

  return (
    <section className="card">
      <div className="card-header">
        <h2>
          <i className="fas fa-table" style={{ color: "var(--accent)", marginRight: 10 }} />
          Recent Translation Jobs
        </h2>
        <div className="card-actions">
          <Link href="/translate/create" className="btn btn-primary btn-sm">
            <i className="fas fa-plus"></i> New Translate
          </Link>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Job Name</th>
              <th>Source</th>
              <th>Target</th>
              <th>Glossary</th>
              <th>Model</th>
              <th>Total Tokens</th>
              <th>Total Cost</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "40px" }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: 30, color: "var(--accent)", marginBottom: 10 }} />
                  <p style={{ margin: 0, color: "var(--text-muted)" }}>Loading translation jobs...</p>
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "40px" }}>
                  <i className="fas fa-inbox" style={{ fontSize: 36, marginBottom: 12, display: "block", color: "#999" }} />
                  No translation jobs found.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.fileName}</td>
                  <td>{job.sourceLang}</td>
                  <td>{job.targetLang}</td>
                  <td>{job.glossary ? job.glossary.name : "No"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{job.provider.model}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{job.totalToken}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {job.totalCost.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <span className={`status-badge ${statusClass[job.status]}`}>
                      {job.status}
                      {!["ERROR", "COMPLETED"].includes(job.status) ? `: ${job.progress}` : ""}
                    </span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(job.createdAt).toLocaleString()}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px", flexWrap: "nowrap" }}>
                      
                      {job.status === "COMPLETED" && (
                        <a href={`/api/translate/${job.id}/download`} className="btn btn-outline btn-xs">
                          <i className="fas fa-download"></i>
                        </a>
                      )}

                      <EllipsisDropdown>
                        <Link href={`/translate/${job.id}`} className={`dropdown-item ${job.status !== "COMPLETED" ? "disabled" : ""}`}>
                          <i className="fas fa-eye"></i> View
                        </Link>
                        <Link href={`api/translate/${job.id}/downloadsource`} className={`dropdown-item ${!["COMPLETED", "PROCESSING"].includes(job.status) ? "disabled" : ""}`}>
                          <i className="fas fa-download"></i> Download Source
                        </Link>
                        <ButtonGenerateGlosary jobId={job.id} jobStatus={job.status} />
                      </EllipsisDropdown>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Kontrol Paginasi */}
      {!isLoading && meta && meta.lastPage > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Halaman <strong>{meta.page}</strong> dari <strong>{meta.lastPage}</strong> (Total: {meta.total} jobs)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            
            <button 
              className="btn btn-outline btn-sm" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={meta.page <= 1}
              style={{ opacity: meta.page <= 1 ? 0.5 : 1 }}
            >
              <i className="fas fa-chevron-left" /> Prev
            </button>

            <button 
              className="btn btn-outline btn-sm" 
              onClick={() => setCurrentPage(prev => Math.min(meta.lastPage, prev + 1))}
              disabled={meta.page >= meta.lastPage}
              style={{ opacity: meta.page >= meta.lastPage ? 0.5 : 1 }}
            >
              Next <i className="fas fa-chevron-right" />
            </button>
            
          </div>
        </div>
      )}
    </section>
  );
}