'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAlert } from '../ui/Alert';
import { updateRowAction } from '@/app/actions/translate/updateRowAction';

export interface SubtitleLine {
    id: number;
    sequence: number;
    start: string;
    end: string;
    source: string;
    translated: string;
}

interface SubtitleEditorProps {
    lines: SubtitleLine[];
    translationId: number;
    videoUrl?: string;   // opsional, bisa diisi dari server
}

export default function SubtitleEditor({
    lines: initialLines,
    translationId,
    videoUrl: initialVideoUrl = '',
}: SubtitleEditorProps) {
    const { showAlert } = useAlert();
    const [lines, setLines] = useState<SubtitleLine[]>(() => { return [...initialLines].sort((a, b) => a.sequence - b.sequence); });
    const [isSaving, setIsSaving] = useState(false);
    const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

    // -------- Drag state untuk video player --------
    const [videoPos, setVideoPos] = useState({ x: 16, y: 16 }); // posisi awal
    const [dragging, setDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

    const nextTempId = useRef(-1);

    // ===================== RESET HIGHLIGHT JIKA VIDEO DIHAPUS =====================
    useEffect(() => {
        // Jika videoUrl kosong (dihapus user), kembalikan activeLineIndex ke null
        if (!videoUrl) {
            setActiveLineIndex(null);
        }
    }, [videoUrl]);

    // ===================== HANDLER SUBTITLE =====================
    const handleAddLine = useCallback(
        (afterIndex?: number) => {
            const newLine: SubtitleLine = {
                id: nextTempId.current--,
                sequence: 0,
                start: '00:00:00,000',
                end: '00:00:02,000',
                source: 'New subtitle line',
                translated: 'New subtitle line',
            };
            setLines((prev) => {
                if (afterIndex !== undefined) {
                    const updated = [...prev];
                    updated.splice(afterIndex + 1, 0, newLine);
                    return updated;
                }
                return [...prev, newLine];
            });
            if (afterIndex === undefined) showAlert('New subtitle line added.', 'success');
        },
        [showAlert]
    );

    const handleDeleteLine = useCallback(
        (index: number) => {
            if (lines.length <= 1) {
                showAlert('At least one subtitle line is required.', 'warning');
                return;
            }
            setLines((prev) => prev.filter((_, i) => i !== index));
            showAlert('Subtitle line deleted.', 'warning');
        },
        [lines, showAlert]
    );

    const handleUpdateLine = useCallback(
        (index: number, field: keyof SubtitleLine, value: string) => {
            setLines((prev) =>
                prev.map((line, i) => (i === index ? { ...line, [field]: value } : line))
            );
        },
        []
    );

    function formatSrtTime(value: string) {
        const digits = value.replace(/\D/g, '').slice(0, 9);
        const hh = digits.slice(0, 2);
        const mm = digits.slice(2, 4);
        const ss = digits.slice(4, 6);
        const ms = digits.slice(6, 9);
        let result = hh;
        if (mm) result += ':' + mm;
        if (ss) result += ':' + ss;
        if (ms) result += ',' + ms;
        return result;
    }

    const resizeTextarea = (el: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {

            // 2. Hitung ulang nilai 'sequence' berdasarkan urutan array yang sudah benar
            const sequencedLines = [...lines].map((line, index) => ({
                ...line,
                sequence: index + 1, // Urutan dimulai dari 1, 2, 3, dst...
            }));
            const result = await updateRowAction(translationId, sequencedLines);
            if (result.success) {
                showAlert('Saved.', 'success');
            } else {
                showAlert(result.message, 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    // ===================== HELPER TIMESTAMP & TRACKING =====================
    // Mengubah "00:00:02,000" menjadi detik (2.0)
    const srtTimeToSeconds = (timestamp: string) => {
        const parts = timestamp.split(',');
        const timePart = parts[0];
        const ms = parts[1] ? parseInt(parts[1], 10) : 0;
        const [hh = '0', mm = '0', ss = '0'] = timePart.split(':');
        return parseInt(hh, 10) * 3600 + parseInt(mm, 10) * 60 + parseInt(ss, 10) + ms / 1000;
    };

    // Fungsi yang dipanggil setiap kali detik video berjalan
    const handleTimeUpdate = () => {
        if (!videoRef.current || lines.length === 0) return;
        const currentTime = videoRef.current.currentTime;

        // Cari baris subtitle mana yang rentang waktunya cocok dengan detik video saat ini
        const currentIndex = lines.findIndex((line) => {
            const startSec = srtTimeToSeconds(line.start);
            const endSec = srtTimeToSeconds(line.end);
            return currentTime >= startSec && currentTime <= endSec;
        });

        setActiveLineIndex(currentIndex !== -1 ? currentIndex : null);
    };

    // ===================== FUNGSI SEEK VIDEO =====================
    const seekToTimestamp = (timestamp: string) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = srtTimeToSeconds(timestamp);
        videoRef.current.play().catch(() => { });
    };

    // ===================== DRAG HANDLER (MOBILE & DESKTOP) =====================
    const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
        // Ambil koordinat awal
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragStart.current = { x: clientX, y: clientY, startX: videoPos.x, startY: videoPos.y };
        setDragging(true);
        e.preventDefault();
    };

    const onDragMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!dragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const dx = clientX - dragStart.current.x;
        const dy = clientY - dragStart.current.y;
        setVideoPos({
            x: dragStart.current.startX + dx,
            y: dragStart.current.startY + dy,
        });
    };

    const onDragEnd = () => {
        setDragging(false);
    };

    // ===================== FUNGSI PLAY/PAUSE VIDEO =====================
    const togglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    };

    // ===================== GENERATE VTT UNTUK VIDEO =====================
    const [subtitleTrackUrl, setSubtitleTrackUrl] = useState('');

    useEffect(() => {
        if (!lines || lines.length === 0) return;

        let vttContent = "WEBVTT\n\n";

        lines.forEach((line, index) => {
            const startVtt = line.start.replace(',', '.');
            const endVtt = line.end.replace(',', '.');
            vttContent += `${index + 1}\n${startVtt} --> ${endVtt} line:90%\n${line.translated}\n\n`;
        });

        const blob = new Blob([vttContent], { type: 'text/vtt' });
        const url = URL.createObjectURL(blob);

        setSubtitleTrackUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [lines]);

    // ===================== RENDER =====================
    return (
        <section className="card">
            <div className="card-header">
                <h2>
                    <i className="fas fa-closed-captioning" style={{ color: 'var(--accent)', marginRight: 10 }} />
                    Subtitle Preview (SRT)
                </h2>
                <div className="card-actions">
                    <button className="btn btn-success btn-sm" onClick={() => handleAddLine()}>
                        <i className="fas fa-plus" /> Add Line
                    </button>
                </div>
            </div>

            {/* Input URL Video */}
            <div className="form-group" style={{ marginBottom: 16 }}>
                <label htmlFor="videoUrl">Video URL (untuk preview)</label>
                <input
                    type="text"
                    id="videoUrl"
                    className="form-control"
                    placeholder="https://example.com/video.mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                />
            </div>

            {/* Container subtitle */}
            <div id="subtitleContainer">
                {lines.map((line, index) => (
                    <div className={`subtitle-line ${activeLineIndex === index ? 'active-line' : ''}`} key={line.id}>
                        <div className="sub-field">
                            <label>Start</label>
                            <input
                                type="text"
                                className="sub-start"
                                value={line.start}
                                onChange={(e) => handleUpdateLine(index, 'start', formatSrtTime(e.target.value))}
                            />
                        </div>
                        <div className="sub-field">
                            <label>End</label>
                            <input
                                type="text"
                                className="sub-end"
                                value={line.end}
                                onChange={(e) => handleUpdateLine(index, 'end', formatSrtTime(e.target.value))}
                            />
                        </div>
                        <div className="sub-field">
                            <label>Source (read-only)</label>
                            <textarea
                                ref={resizeTextarea}
                                readOnly
                                className="sub-source"
                                rows={1}
                                value={line.source}
                                onChange={(e) => handleUpdateLine(index, 'source', e.target.value)}
                            />
                        </div>
                        <div className="sub-field">
                            <label>Translation</label>
                            <textarea
                                ref={resizeTextarea}
                                className="sub-translated"
                                rows={1}
                                value={line.translated}
                                onChange={(e) => handleUpdateLine(index, 'translated', e.target.value)}
                            />
                        </div>
                        <div className="sub-actions">
                            {/* Tombol Play untuk seek video */}
                            {videoUrl && (
                                <button
                                    className="btn-play-line"
                                    title="Seek video to this timestamp"
                                    onClick={() => seekToTimestamp(line.start)}
                                >
                                    <i className="fas fa-play" />
                                </button>
                            )}
                            <button
                                className="btn-add-line"
                                title="Add line after this"
                                onClick={() => handleAddLine(index)}
                            >
                                <i className="fas fa-plus-circle" />
                            </button>
                            <button
                                className="btn-del-line"
                                title="Delete this line"
                                onClick={() => handleDeleteLine(index)}
                            >
                                <i className="fas fa-trash-alt" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tombol Save */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 12 }}>
                <button className="btn btn-outline btn-sm" onClick={handleSave} disabled={isSaving}>
                    <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`} />{' '}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* ===== FLOATING VIDEO PLAYER (hanya tampil jika ada videoUrl) ===== */}
            {videoUrl && (
                <div
                    className="floating-video"
                    style={{
                        position: 'fixed',
                        left: videoPos.x,
                        top: videoPos.y,
                        zIndex: 5000,
                        width: 320,
                        maxWidth: 'calc(100vw - 32px)',
                        background: '#000',
                        borderRadius: 8,
                        overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                        cursor: dragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        touchAction: 'none', // penting untuk mencegah scroll saat drag
                    }}
                    onMouseDown={onDragStart}
                    onTouchStart={onDragStart}
                    onMouseMove={onDragMove}
                    onTouchMove={onDragMove}
                    onMouseUp={onDragEnd}
                    onTouchEnd={onDragEnd}
                    onMouseLeave={onDragEnd}
                >
                    {/* Handle drag visual */}
                    <div className="floating-video-header">
                        <span>🎥 Video Preview (drag me)</span>
                        <button
                            onClick={() => setVideoUrl('')} // close
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                fontSize: 16,
                                cursor: 'pointer',
                                padding: 0,
                                lineHeight: 1,
                            }}
                        >
                            ✕
                        </button>
                    </div>
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        onClick={togglePlayPause}
                        onTimeUpdate={handleTimeUpdate}
                        style={{ width: '100%', display: 'block' }}
                    >
                        {/* TAMBAHKAN TRACK INI UNTUK MENAMPILKAN SUBTITLE */}
                        {subtitleTrackUrl && (
                            <track
                                kind="subtitles"
                                src={subtitleTrackUrl}
                                srcLang="id"
                                label="Translated"
                                default
                            />
                        )}
                    </video>
                </div>
            )}
        </section>
    );
}