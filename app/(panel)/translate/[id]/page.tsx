import SubtitleEditor, { SubtitleLine } from "@/app/components/translate/SubtitleEditor";
import { api } from "@/app/lib/api";
import "./video-preview.css";

interface Translation {
  id: number;
  fileName: string;
  sourceLang: string;
  targetLang: string;
  videoSource: string | null;
  rows: {
    id: number;
    sequence: number;
    startTime: string;
    endTime: string;
    sourceText: string;
    targetText: string | null;
  }[];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const translation = await api<Translation>(`/translate/${id}`);

  const lines: SubtitleLine[] = translation.rows.map((row) => ({
    id: row.id,
    sequence: row.sequence,
    start: row.startTime,
    end: row.endTime,
    source: row.sourceText,
    translated: row.targetText ?? "",
  }));

  return <SubtitleEditor lines={lines} translationId={translation.id} videoUrl={translation.videoSource} />;
}