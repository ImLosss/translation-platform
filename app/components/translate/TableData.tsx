import { api } from "@/app/lib/api";
import Link from "next/dist/client/link";
import EllipsisDropdown from "../client/ElipsisDropdown";
import ButtonGenerateGlosary from "./ButtonGenerateGlosary";

export interface Translation {
  id: number;
  fileName: string;
  sourceLang: string;
  targetLang: string;

  status: "PROCESSING" | "COMPLETED" | "ERROR";

  batchSize: number;

  glossaryId: number | null;
  glossary: {
    id: number;
    name: string;
  } | null;

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

export default async function TableData() {
  let jobs = [];
  try {
    jobs = await api<Translation[]>("/translate")
    console.log("Fetched translation jobs:", jobs);
  } catch (error) {
    return (
      <section className="card">
        <div className="card-header">
          <h2>Recent Translation Jobs</h2>
        </div>

        <div style={{ padding: "40px", textAlign: "center" }}>
          <i
            className="fas fa-triangle-exclamation"
            style={{ fontSize: 40, color: "#dc3545" }}
          />
          <p>Failed to load translation data.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>
          <i
            className="fas fa-table"
            style={{ color: "var(--accent)", marginRight: 10 }}
          />
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
              <th>Total Tokens</th>
              <th>Total Cost</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "40px" }}>
                  <i
                    className="fas fa-inbox"
                    style={{
                      fontSize: 36,
                      marginBottom: 12,
                      display: "block",
                      color: "#999",
                    }}
                  />
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
                  <td>{job.totalToken}</td>
                  <td>{job.totalCost.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                  <td><span className={`status-badge ${statusClass[job.status]}`}>{job.status}</span></td>
                  <td>{new Date(job.createdAt).toLocaleString()}</td>
                  <td style={{ textAlign: "right" }}>
                    {/* Tambahkan div container flex di sini */}
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px", flexWrap: "nowrap" }}>

                      {job.status === "COMPLETED" && (
                        <a href={`/api/translate/${job.id}/download`} className="btn btn-outline btn-xs">
                          <i className="fas fa-download"></i>
                        </a>
                      )}

                      <EllipsisDropdown>
                        <Link
                          href={`/translate/${job.id}`}
                          className={`dropdown-item ${job.status !== "COMPLETED" ? "disabled" : ""}`}
                        >
                          <i className="fas fa-eye"></i> View
                        </Link>

                        <Link
                          href={`api/translate/${job.id}/downloadsource`}
                          className={`dropdown-item ${!["COMPLETED", "PROCESSING"].includes(job.status) ? "disabled" : ""}`}
                        >
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