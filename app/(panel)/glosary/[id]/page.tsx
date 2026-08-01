import GlosaryEditor, { GlosaryEntry } from "@/app/components/glosary/GlosaryEditor";
import { api } from "@/app/lib/api";
import "./glosary-entries.css";

interface Glosary {
  id: number;
  name: string;
  sourceLanguage: string;
  targetLanguage: string;
  rows: {
    id: number;
    source: string;
    target: string;
    detail: string | null;
  }[];
}

export interface GlosaryData {
  id: number;
  name: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const glosary = await api<Glosary>(`/glosary/${id}`);

  const entries: GlosaryEntry[] = (glosary?.rows || [{ id: -1, source: '', target: '', detail: null }]).map((row) => ({
    id: row.id,
    source: row.source, 
    target: row.target,     
    detail: row.detail || "",
  }));

  const glosaryData: GlosaryData = {
    id: glosary.id,
    name: glosary.name,
    sourceLanguage: glosary.sourceLanguage,
    targetLanguage: glosary.targetLanguage,
  };

  return <GlosaryEditor entries={entries} glosary={glosaryData} />;
}