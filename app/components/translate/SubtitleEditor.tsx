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
    // Simpan inisialisasi awal ke variabel agar bisa dipakai di dua state
    const initialSortedLines = [...initialLines].sort((a, b) => a.sequence - b.sequence);
    
    const [lines, setLines] = useState<SubtitleLine[]>(initialSortedLines);
    
    // State baru untuk menyimpan kondisi terakhir kali di-save (atau saat pertama load)
    const [lastSavedLines, setLastSavedLines] = useState<SubtitleLine[]>(initialSortedLines);
    const [isSaving, setIsSaving] = useState(false);
    const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

    // -------- State untuk Loading & Tampilan Video --------
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false); // <--- State baru untuk tombol preview

    // -------- Drag state untuk video player --------
    const [videoPos, setVideoPos] = useState({ x: 16, y: 16 });
    const [dragging, setDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

    const nextTempId = useRef(-1);

    // ===================== EXTRACT DRIVE ID =====================
    function extractId(url: string) {
        const regex1 = /\/file\/d\/([a-zA-Z0-9_-]+)/; const regex2 = /id=([a-zA-Z0-9_-]+)/;
        let match = url.match(regex1); if (match && match[1]) return match[1];
        match = url.match(regex2);
        if (match && match[1]) return match[1];
        return null;
    }

    const driveId = extractId(videoUrl);

    // ===================== FUNGSI RESET =====================
    const handleReset = useCallback(() => {
        setLines([...lastSavedLines]); // Kembalikan state lines ke kondisi last saved
        showAlert('Successfully reset to last saved state.', 'info');
    }, [lastSavedLines, showAlert]);

    // ===================== RESET HIGHLIGHT JIKA VIDEO DIHAPUS / DISEMBUNYIKAN =====================
    useEffect(() => {
        if (!driveId || !showPreview) {
            setActiveLineIndex(null);
        }
    }, [driveId, showPreview]);

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
            const sequencedLines = lines.map((line, index) => ({
                ...line,
                sequence: index + 1,
            }));
            const result = await updateRowAction(translationId, sequencedLines);
            if (result.success) {
                showAlert('Saved.', 'success');
                setLastSavedLines(sequencedLines);
                setLines(sequencedLines); 
            } else {
                showAlert(result.message, 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async () => {
        setIsSaving(true);
        try {
            const sequencedLines = lines.map((line, index) => ({
                ...line,
                sequence: index + 1,
            }));

            const result = await updateRowAction(translationId, sequencedLines);
            if (result.success) {
                setLastSavedLines(sequencedLines);
                setLines(sequencedLines); 
                window.open(`/api/translate/${translationId}/download`);
            } else {
                showAlert(result.message, 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    // ===================== HELPER TIMESTAMP & TRACKING =====================
    const srtTimeToSeconds = (timestamp: string) => {
        const parts = timestamp.split(',');
        const timePart = parts[0];
        const ms = parts[1] ? parseInt(parts[1], 10) : 0;
        const [hh = '0', mm = '0', ss = '0'] = timePart.split(':');
        return parseInt(hh, 10) * 3600 + parseInt(mm, 10) * 60 + parseInt(ss, 10) + ms / 1000;
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current || lines.length === 0) return;
        const currentTime = videoRef.current.currentTime;

        const currentIndex = lines.findIndex((line) => {
            const startSec = srtTimeToSeconds(line.start);
            const endSec = srtTimeToSeconds(line.end);
            return currentTime >= startSec && currentTime <= endSec;
        });

        setActiveLineIndex(currentIndex !== -1 ? currentIndex : null);
    };

    const seekToTimestamp = (timestamp: string) => {
        if (!videoRef.current || !showPreview) return; // Cegah error jika preview ditutup
        videoRef.current.currentTime = srtTimeToSeconds(timestamp);
        videoRef.current.play().catch(() => { });
    };

    // ===================== DRAG HANDLER =====================
    const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
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

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    };

    // ===================== GENERATE VTT =====================
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
                    <button className="btn btn-outline btn-sm" onClick={handleReset}>
                        <i className="fas fa-undo" /> Reset
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleExport} disabled={isSaving}>
                        <i className="fas fa-save" /> Save & Export
                    </button>
                </div>
            </div>

            {/* Input URL Video & Tombol Preview */}
            <div className="form-group" style={{ marginBottom: 16 }}>
                <label htmlFor="videoUrl">Google Drive Video URL (PUBLIC)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        id="videoUrl"
                        className="form-control"
                        placeholder="https://drive.google.com/file/d/ID_VIDEO/view"
                        value={videoUrl}
                        onChange={(e) => {
                            setVideoUrl(e.target.value);
                            // Otomatis matikan preview jika URL dikosongkan
                            if (!e.target.value) setShowPreview(false);
                        }}
                        style={{ flex: 1, minWidth: '200px' }}
                    />
                    {/* Tombol Tampilkan Preview hanya muncul jika driveId ada (link valid) */}
                    {driveId && (
                        <button
                            className={`btn ${showPreview ? 'btn-outline' : 'btn-primary'}`}
                            onClick={() => setShowPreview(!showPreview)}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            <i className={`fas ${showPreview ? 'fa-eye-slash' : 'fa-eye'}`} />{' '}
                            {showPreview ? 'Sembunyikan Preview' : 'Tampilkan Preview'}
                        </button>
                    )}
                </div>
                {videoUrl && !driveId && (
                    <small style={{ color: '#dc3545', marginTop: '4px', display: 'block' }}>
                        *Link tidak valid. Pastikan Anda memasukkan link Google Drive yang benar.
                    </small>
                )}
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
                            {/* Tombol Play hanya bisa diklik jika preview sedang terbuka */}
                            {driveId && (
                                <button
                                    className="btn-play-line"
                                    title={showPreview ? "Seek video to this timestamp" : "Buka Preview terlebih dahulu"}
                                    onClick={() => seekToTimestamp(line.start)}
                                    disabled={!showPreview}
                                    style={{ opacity: showPreview ? 1 : 0.5, cursor: showPreview ? 'pointer' : 'not-allowed' }}
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

            {/* ===== FLOATING VIDEO PLAYER (Tampil jika driveId valid & showPreview true) ===== */}
            {driveId && showPreview && (
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
                        touchAction: 'none',
                    }}
                    onMouseDown={onDragStart}
                    onTouchStart={onDragStart}
                    onMouseMove={onDragMove}
                    onTouchMove={onDragMove}
                    onMouseUp={onDragEnd}
                    onTouchEnd={onDragEnd}
                    onMouseLeave={onDragEnd}
                >
                    <div className="floating-video-header">
                        <span>🎥 Video Preview (drag me)</span>
                        <button
                            onClick={() => setShowPreview(false)} // <--- Ubah: Hanya hide, bukan reset URL
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

                    <div style={{ position: 'relative' }}>
                        {isVideoLoading && (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                zIndex: 10,
                                color: 'white'
                            }}>
                                <i className="fas fa-spinner fa-spin fa-2x"></i>
                            </div>
                        )}

                        <video
                            ref={videoRef}
                            src={`/api/video/preview/${driveId}`}
                            onClick={togglePlayPause}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadStart={() => setIsVideoLoading(true)}
                            onWaiting={() => setIsVideoLoading(true)}
                            onCanPlay={() => setIsVideoLoading(false)}
                            onPlaying={() => setIsVideoLoading(false)}
                            onError={() => { 
                                setIsVideoLoading(false);
                                showAlert("Failed to load video preview. Check the URL or Google Drive sharing settings.", "error"); 
                            }}
                            style={{ width: '100%', display: 'block', cursor: 'pointer' }}
                        >
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
                </div>
            )}
        </section>
    );
}