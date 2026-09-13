'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import EllipsisDropdown from "../client/ElipsisDropdown";
import ButtonGenerateGlosary from "./ButtonGenerateGlosary";
import { getTranslationsAction } from "@/app/actions/translate/getTranslationsAction";

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

export default function TableData() {
  const [jobs, setJobs] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(true); // State untuk mengontrol ikon loading

  // 1. useEffect Pertama: Untuk mengambil data saat komponen pertama kali dimuat di layar
  useEffect(() => {
    const fetchInitialData = async () => {
      const result = await getTranslationsAction();
      if (result.success && result.data) {
        setJobs(result.data);
      }
      setIsLoading(false); // Matikan loading setelah data pertama berhasil didapat
    };

    fetchInitialData();
  }, []);

  // 2. useEffect Kedua: Logika interval (polling) setiap 5 detik
  useEffect(() => {
    // Jangan mulai interval kalau data awal saja belum selesai dimuat
    if (isLoading) return; 

    const hasPendingJobs = jobs.some(
      (job) => job.status === "PROCESSING" || job.status === "TRANSCRIBING"
    );

    // Hentikan interval jika semua sudah selesai atau error
    if (!hasPendingJobs) return;

    const timer = setInterval(async () => {
      const result = await getTranslationsAction();
      if (result.success && result.data) {
        setJobs(result.data);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [jobs, isLoading]);

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
            {/* Tampilkan Loading Spinner jika isLoading true */}
            {isLoading ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "40px" }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: 30, color: "var(--accent)", marginBottom: 10 }} />
                  <p style={{ margin: 0, color: "var(--text-muted)" }}>Loading translation jobs...</p>
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              // Tampilkan pesan kosong jika tidak ada data
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "40px" }}>
                  <i className="fas fa-inbox" style={{ fontSize: 36, marginBottom: 12, display: "block", color: "#999" }} />
                  No translation jobs found.
                </td>
              </tr>
            ) : (
              // Tampilkan data tabel jika data tersedia
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
                  <td>
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
    </section>
  );
}