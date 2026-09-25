'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import EllipsisDropdown from "../client/ElipsisDropdown";
import DeleteGlossaryButton from "./DeleteGlossaryButton";
import DuplicateGlossaryButton from "./DuplicateGlossaryButton";
import { getGlosariesAction } from "@/app/actions/glosary/getGlosariesAction";
import { useLanguage } from "../client/LanguageProvider";

export interface GlosaryData {
  id: number;
  name: string;
  sourceLanguage: string;
  targetLanguage: string;
  userId: number;

  createdAt: string;
  updatedAt: string;
}

export default function TableData() {
  const { t, intlLocale } = useLanguage();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'id';
  const [glosary, setGlosary] = useState<GlosaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      const result = await getGlosariesAction();

      if (!isMounted) return;

      if (result.success && result.data) {
        setGlosary(result.data);
        setHasError(false);
      } else {
        setHasError(true);
      }
      setIsLoading(false);
    };

    fetchData();

    return () => { isMounted = false; };
  }, []);

  if (hasError) {
    return (
      <section className="card">
        <div className="card-header">
          <h2>{t.glossary.listTitle}</h2>
        </div>

        <div style={{ padding: "40px", textAlign: "center" }}>
          <i
            className="fas fa-triangle-exclamation"
            style={{ fontSize: 40, color: "#dc3545" }}
          />
          <p>{t.glossary.failedLoad}</p>
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
          {t.glossary.listTitle}
        </h2>

        <div className="card-actions">
          <Link href={`/${locale}/glosary/create`} className="btn btn-primary btn-sm">
            <i className="fas fa-plus"></i> {t.glossary.newGlossary}
          </Link>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.glossary.table.name}</th>
              <th>{t.glossary.table.source}</th>
              <th>{t.glossary.table.target}</th>
              <th>{t.glossary.table.createdAt}</th>
              <th style={{ textAlign: "right" }}>{t.glossary.table.actions}</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>
                  <i
                    className="fas fa-spinner fa-spin"
                    style={{ fontSize: 30, color: "var(--accent)", marginBottom: 12, display: "block" }}
                  />
                  {t.glossary.loading}
                </td>
              </tr>
            ) : glosary.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>
                  <i
                    className="fas fa-inbox"
                    style={{
                      fontSize: 36,
                      marginBottom: 12,
                      display: "block",
                      color: "#999",
                    }}
                  />
                  {t.glossary.empty}
                </td>
              </tr>
            ) : (
              glosary.map((g) => (
                <tr key={g.id}>
                  <td>{g.name}</td>
                  <td>{g.sourceLanguage}</td>
                  <td>{g.targetLanguage}</td>
                  <td>{new Date(g.createdAt).toLocaleString(intlLocale)}</td>
                  <td style={{ textAlign: "right" }}>
                    <EllipsisDropdown>
                      <Link href={`/${locale}/glosary/${g.id}`} className="dropdown-item">
                        <i className="fas fa-eye"></i> {t.glossary.view}
                      </Link>
                      <Link href={`/${locale}/glosary/${g.id}/edit`} className="dropdown-item">
                        <i className="fas fa-edit"></i> {t.glossary.edit}
                      </Link>
                      <DuplicateGlossaryButton glossaryId={g.id} />
                      <Link href={`api/glosary/${g.id}/download`} className={`dropdown-item`}>
                        <i className="fas fa-download"></i> {t.glossary.downloadCsv}
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