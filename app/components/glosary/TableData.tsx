import { api } from "@/app/lib/api";
import Link from "next/dist/client/link";
import EllipsisDropdown from "../client/ElipsisDropdown";
import DeleteGlossaryButton from "./DeleteGlossaryButton";

export interface GlosaryData {
  id: number;
  name: string;
  sourceLanguage: string;
  targetLanguage: string;
  userId: number;

  createdAt: string;
  updatedAt: string;
}

export default async function TableData() {
  let glosary = [];
  try {
    glosary = await api<GlosaryData[]>("/glosary")
    console.log("glosary", glosary)
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
            {glosary.length === 0 ? (
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
              glosary.map((g) => (
                <tr key={g.id}>
                  <td>{g.name}</td>
                  <td>{g.sourceLanguage}</td>
                  <td>{g.targetLanguage}</td>
                  <td>{new Date(g.createdAt).toLocaleString()}</td>
                  <td style={{  textAlign: "right" }}>
                    <EllipsisDropdown>
                      <Link href={`/glosary/${g.id}`} className="dropdown-item">
                        <i className="fas fa-eye"></i> View
                      </Link>
                      <Link href={`/glosary/${g.id}/edit`} className="dropdown-item">
                        <i className="fas fa-edit"></i> Edit
                      </Link>
                      <Link href={`api/glosary/${g.id}/download`} className={`dropdown-item`}>
                        <i className="fas fa-download"></i> Download CSV
                      </Link>
                      <DeleteGlossaryButton glossaryId={g.id} />
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