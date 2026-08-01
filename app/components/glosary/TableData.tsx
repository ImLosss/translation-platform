import { api } from "@/app/lib/api";
import Link from "next/dist/client/link";
import EllipsisDropdown from "../client/ElipsisDropdown";

export interface Translation {
  id: number;
  name: string;
  sourceLanguage: string;
  targetLanguage: string;
  userId: number;

  createdAt: string;
  updatedAt: string;
}

const statusClass = {
  PROCESSING: "warning",
  COMPLETED: "success",
  ERROR: "danger",
};

export default async function TableData() {
  let jobs = [];
  try {
    jobs = await api<Translation[]>("/glosary")
    console.log("jobs", jobs)
  } catch (error) {
    return (
      <section className="card">
        <div className="card-header">
          <h2>List Glosaries</h2>
        </div>

        <div style={{ padding: "40px", textAlign: "center" }}>
          <i
            className="fas fa-triangle-exclamation"
            style={{ fontSize: 40, color: "#dc3545" }}
          />
          <p>Failed to load glosary data.</p>
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
          List Glosaries
        </h2>

        <div className="card-actions">
          <Link href="/glosary/create" className="btn btn-primary btn-sm">
            <i className="fas fa-plus"></i> New Glosary
          </Link>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Source</th>
              <th>Target</th>
              <th>Created At</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                  <i
                    className="fas fa-inbox"
                    style={{
                      fontSize: 36,
                      marginBottom: 12,
                      display: "block",
                      color: "#999",
                    }}
                  />
                  No Glosary found.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.name}</td>
                  <td>{job.sourceLanguage}</td>
                  <td>{job.targetLanguage}</td>
                  <td>{new Date(job.createdAt).toLocaleString()}</td>
                  <td style={{  textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <EllipsisDropdown>
                      <Link href={`/glosary/${job.id}`} className="dropdown-item">
                        <i className="fas fa-eye"></i> View
                      </Link>
                      <Link href={`/glosary/${job.id}/edit`} className="dropdown-item">
                        <i className="fas fa-edit"></i> Edit
                      </Link>
                      <form method="POST">
                        <input type="hidden" name="id" value={job.id} />
                        <button type="submit" className="dropdown-item delete">
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </form>
                    </EllipsisDropdown>
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