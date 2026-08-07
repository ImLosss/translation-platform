'use client';

import { useState, useCallback, useRef, useEffect, memo } from 'react';
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
    videoUrl?: string | null;
}

// ======== KOMPONEN SUBTITLE ROW YANG DI-MEMOISASI ========
const SubtitleRow = memo(({
    line,
    index,
    isActive,
    showPreview,
    driveId,
    handleTimeChange,
    handleTimeBlur,
    handleUpdateLine,
    seekToTimestamp,
    handleAddLine,
    handleDeleteLine,
    resizeTextarea
}: any) => {
    return (
        <div
            className={`subtitle-line ${isActive ? 'active-line' : ''}`}
            style={{ position: 'relative', paddingBottom: '36px' }}
        >
            {/* KOLOM WAKTU */}
            <div className="sub-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input
                    type="text"
                    className="sub-start"
                    title="Start Time"
                    value={line.start}
                    onChange={(e) => handleTimeChange(e, index, 'start')}
                    onBlur={() => handleTimeBlur(index, 'start')}
                    style={{ textAlign: 'center' }}
                />
                <input
                    type="text"
                    className="sub-end"
                    title="End Time"
                    value={line.end}
                    onChange={(e) => handleTimeChange(e, index, 'end')}
                    onBlur={() => handleTimeBlur(index, 'end')}
                    style={{ textAlign: 'center' }}
                />
            </div>

            {/* KOLOM SOURCE */}
            <div className="sub-field" style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}>
                <label>Source</label>
                <textarea
                    ref={resizeTextarea}
                    readOnly
                    className="sub-source"
                    rows={1}
                    value={line.source}
                    onChange={(e) => handleUpdateLine(index, 'source', e.target.value)}
                />
            </div>

            {/* KOLOM TRANSLATION */}
            <div className="sub-field" style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}>
                <label>Translation</label>
                <textarea
                    ref={resizeTextarea}
                    className="sub-translated"
                    rows={1}
                    value={line.translated}
                    onChange={(e) => handleUpdateLine(index, 'translated', e.target.value)}
                />
            </div>

            {/* KOLOM AKSI */}
            <div className="sub-actions">
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
                <button className="btn-add-line" title="Add Line" onClick={() => handleAddLine(index)}>
                    <i className="fas fa-plus-circle" />
                </button>
                <button className="btn-del-line" title="Delete Line" onClick={() => handleDeleteLine(index)}>
                    <i className="fas fa-trash-alt" />
                </button>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom perbandingan agar hanya baris yang berubah yang di-render ulang
    return (
        prevProps.line === nextProps.line &&
        prevProps.isActive === nextProps.isActive &&
        prevProps.showPreview === nextProps.showPreview &&
        prevProps.index === nextProps.index
    );
});


// ======== KOMPONEN UTAMA ========
export default function SubtitleEditor({
    lines: initialLines,
    translationId,
    videoUrl: initialVideoUrl = '',
}: SubtitleEditorProps) {
    const { showAlert } = useAlert();
    const initialSortedLines = [...initialLines].sort((a, b) => a.sequence - b.sequence);

    const [lines, setLines] = useState<SubtitleLine[]>(initialSortedLines);
    const [lastSavedLines, setLastSavedLines] = useState<SubtitleLine[]>(initialSortedLines);
    const [isSaving, setIsSaving] = useState(false);
    const [videoUrl, setVideoUrl] = useState(initialVideoUrl ?? '');
    const videoRef = useRef<HTMLVideoElement>(null);
    const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // -------- State Video Pause/Play --------
    const [isPaused, setIsPaused] = useState(true);
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

    // -------- State Posisi & Ukuran (Drag & Resize) --------
    const [videoPos, setVideoPos] = useState({ x: 16, y: 16 });
    const [videoWidth, setVideoWidth] = useState(320);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);

    const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
    const resizeStart = useRef({ x: 0, startWidth: 0 });
    const nextTempId = useRef(-1);

    function extractId(url: string) {
        const regex1 = /\/file\/d\/([a-zA-Z0-9_-]+)/; const regex2 = /id=([a-zA-Z0-9_-]+)/;
        let match = url.match(regex1); if (match && match[1]) return match[1];
        match = url.match(regex2);
        if (match && match[1]) return match[1];
        return null;
    }

    const driveId = videoUrl ? extractId(videoUrl) : null;

    const handleReset = useCallback(() => {
        setLines([...lastSavedLines]);
        showAlert('Successfully reset to last saved state.', 'info');
    }, [lastSavedLines, showAlert]);

    useEffect(() => {
        if (!driveId || !showPreview) setActiveLineIndex(null);
    }, [driveId, showPreview]);

    const handleAddLine = useCallback((afterIndex?: number) => {
        const newLine: SubtitleLine = {
            id: nextTempId.current--, sequence: 0, start: '00:00:00,000',
            end: '00:00:02,000', source: 'New subtitle line', translated: 'New subtitle line',
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
    }, [showAlert]);

    const handleDeleteLine = useCallback((index: number) => {
        if (lines.length <= 1) { showAlert('At least one subtitle line is required.', 'warning'); return; }
        setLines((prev) => prev.filter((_, i) => i !== index));
        showAlert('Subtitle line deleted.', 'warning');
    }, [lines, showAlert]);

    const handleUpdateLine = useCallback((index: number, field: keyof SubtitleLine, value: string) => {
        setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
    }, []);

    function formatSrtTime(value: string) {
        const digits = value.replace(/\D/g, '').slice(0, 9);
        const hh = digits.slice(0, 2); const mm = digits.slice(2, 4);
        const ss = digits.slice(4, 6); const ms = digits.slice(6, 9);
        let result = hh;
        if (mm) result += ':' + mm; if (ss) result += ':' + ss; if (ms) result += ',' + ms;
        return result;
    }

    const resizeTextarea = useCallback((el: HTMLTextAreaElement | null) => {
        if (!el) return; el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`;
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const sequencedLines = lines.map((line, index) => ({ ...line, sequence: index + 1 }));
            const result = await updateRowAction(translationId, sequencedLines);
            if (result.success) {
                showAlert('Saved.', 'success');
                setLastSavedLines(sequencedLines); setLines(sequencedLines);
            } else showAlert(result.message, 'error');
        } finally { setIsSaving(false); }
    };

    const handleExport = async () => {
        setIsSaving(true);
        try {
            const sequencedLines = lines.map((line, index) => ({ ...line, sequence: index + 1 }));
            const result = await updateRowAction(translationId, sequencedLines);
            if (result.success) {
                setLastSavedLines(sequencedLines); setLines(sequencedLines);
                window.open(`/api/translate/${translationId}/download`);
            } else showAlert(result.message, 'error');
        } finally { setIsSaving(false); }
    };

    const srtTimeToSeconds = (timestamp: string) => {
        const parts = timestamp.split(',');
        const ms = parts[1] ? parseInt(parts[1], 10) : 0;
        const [hh = '0', mm = '0', ss = '0'] = parts[0].split(':');
        return parseInt(hh, 10) * 3600 + parseInt(mm, 10) * 60 + parseInt(ss, 10) + ms / 1000;
    };

    const secondsToSrtTime = (seconds: number) => {
        if (isNaN(seconds) || seconds < 0) seconds = 0;
        const hh = Math.floor(seconds / 3600);
        const mm = Math.floor((seconds % 3600) / 60);
        const ss = Math.floor(seconds % 60);
        const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
        const pad = (num: number, size: number) => String(num).padStart(size, '0');
        return `${pad(hh, 2)}:${pad(mm, 2)}:${pad(ss, 2)},${pad(ms, 3)}`;
    };

    const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number, field: 'start' | 'end') => {
        const input = e.target;
        let rawValue = input.value;
        const cursor = input.selectionStart || 0;
        const oldValue = lines[index][field];

        const digitsBefore = rawValue.slice(0, cursor).replace(/\D/g, '').length;
        const diff = rawValue.length - oldValue.length;

        if (diff < 0) {
            rawValue = rawValue.slice(0, cursor) + '0'.repeat(Math.abs(diff)) + rawValue.slice(cursor);
        } else if (diff > 0) {
            let charsToRemove = diff;
            let scanIndex = cursor;
            while (charsToRemove > 0 && scanIndex < rawValue.length) {
                if (rawValue[scanIndex] === ':' || rawValue[scanIndex] === ',') {
                    scanIndex++;
                } else {
                    rawValue = rawValue.slice(0, scanIndex) + rawValue.slice(scanIndex + 1);
                    charsToRemove--;
                }
            }
        }

        const formatted = formatSrtTime(rawValue);
        handleUpdateLine(index, field, formatted);

        window.requestAnimationFrame(() => {
            let newPos = 0;
            let digits = 0;
            for (let i = 0; i < formatted.length; i++) {
                if (digits === digitsBefore) break;
                if (/\d/.test(formatted[i])) digits++;
                newPos = i + 1;
            }
            input.setSelectionRange(newPos, newPos);
        });
    }, [lines, handleUpdateLine]);

    const handleTimeBlur = useCallback((index: number, field: 'start' | 'end') => {
        setLines((prev) => {
            const newLines = [...prev];
            const line = { ...newLines[index] };

            const currentSec = srtTimeToSeconds(line[field]);
            line[field] = secondsToSrtTime(currentSec);

            const startSec = srtTimeToSeconds(line.start);
            const endSec = srtTimeToSeconds(line.end);

            if (endSec <= startSec) {
                line.end = secondsToSrtTime(startSec + 0.5);
            }

            newLines[index] = line;
            return newLines;
        });
    }, []);

    const handleTimeUpdate = () => {
        if (!videoRef.current || lines.length === 0) return;
        const currentTime = videoRef.current.currentTime;
        const currentIndex = lines.findIndex((line) => {
            return currentTime >= srtTimeToSeconds(line.start) && currentTime <= srtTimeToSeconds(line.end);
        });
        setActiveLineIndex(currentIndex !== -1 ? currentIndex : null);
    };

    const seekToTimestamp = useCallback((timestamp: string) => {
        if (!videoRef.current || !showPreview) return;
        videoRef.current.currentTime = srtTimeToSeconds(timestamp);
        videoRef.current.play().catch(() => { });
    }, [showPreview]);

    const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const speed = parseFloat(e.target.value);
        setPlaybackSpeed(speed);
        if (videoRef.current) videoRef.current.playbackRate = speed;
    };

    const onVideoCanPlay = () => {
        setIsVideoLoading(false);
        if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
    };

    const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragStart.current = { x: clientX, y: clientY, startX: videoPos.x, startY: videoPos.y };
        setDragging(true);
    };

    const onResizeStart = (e: React.TouchEvent | React.MouseEvent) => {
        e.stopPropagation();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        resizeStart.current = { x: clientX, startWidth: videoWidth };
        setResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (dragging) {
                if (e.cancelable) e.preventDefault();
                const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
                const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
                setVideoPos({
                    x: dragStart.current.startX + (clientX - dragStart.current.x),
                    y: dragStart.current.startY + (clientY - dragStart.current.y),
                });
            } else if (resizing) {
                if (e.cancelable) e.preventDefault();
                const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
                let newWidth = resizeStart.current.startWidth + (clientX - resizeStart.current.x);
                if (newWidth < 250) newWidth = 250;
                const maxWidth = window.innerWidth - 32;
                if (newWidth > maxWidth) newWidth = maxWidth;
                setVideoWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setDragging(false);
            setResizing(false);
        };

        if (dragging || resizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleMouseMove, { passive: false });
            document.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [dragging, resizing]);

    const togglePlayPause = () => {
        if (videoRef.current) {
            videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
        }
    };

    const [subtitleTrackUrl, setSubtitleTrackUrl] = useState('');

    // ======== EFEK VTT DENGAN DEBOUNCE ========
    useEffect(() => {
        if (!lines || lines.length === 0) return;

        // Debounce: tunggu 500ms setelah user berhenti mengetik
        const timeoutId = setTimeout(() => {
            let vttContent = "WEBVTT\n\n";
            lines.forEach((line, index) => {
                vttContent += `${index + 1}\n${line.start.replace(',', '.')} --> ${line.end.replace(',', '.')} line:90%\n${line.translated}\n\n`;
            });
            const blob = new Blob([vttContent], { type: 'text/vtt' });
            const url = URL.createObjectURL(blob);
            
            setSubtitleTrackUrl((prevUrl) => {
                if (prevUrl) URL.revokeObjectURL(prevUrl);
                return url;
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [lines]);

    return (
        <section className="card">
            <div className="card-header">
                <h2>
                    <i className="fas fa-closed-captioning" style={{ color: 'var(--accent)', marginRight: 10 }} />
                    Subtitle Preview (SRT)
                </h2>
                <div className="card-actions">
                    <button className="btn btn-outline btn-sm" onClick={handleReset}><i className="fas fa-undo" /> Reset</button>
                    <button className="btn btn-primary btn-sm" onClick={handleExport} disabled={isSaving}><i className="fas fa-save" /> Save & Export</button>
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
                <label htmlFor="videoUrl">Google Drive Video URL (PUBLIC)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                        type="text" id="videoUrl" className="form-control"
                        placeholder="https://drive.google.com/file/d/ID_VIDEO/view"
                        value={videoUrl} onChange={(e) => { setVideoUrl(e.target.value); if (!e.target.value) setShowPreview(false); }}
                        style={{ flex: 1, minWidth: '200px' }}
                    />
                    {driveId && (
                        <button className={`btn ${showPreview ? 'btn-outline' : 'btn-primary'}`} onClick={() => setShowPreview(!showPreview)} style={{ whiteSpace: 'nowrap' }}>
                            <i className={`fas ${showPreview ? 'fa-eye-slash' : 'fa-eye'}`} /> {showPreview ? 'Sembunyikan Preview' : 'Tampilkan Preview'}
                        </button>
                    )}
                </div>
            </div>

            {/* ======== RENDER BARIS YANG SUDAH DIOPTIMASI ======== */}
            <div id="subtitleContainer">
                {lines.map((line, index) => (
                    <SubtitleRow
                        key={line.id}
                        line={line}
                        index={index}
                        isActive={activeLineIndex === index}
                        showPreview={showPreview}
                        driveId={driveId}
                        handleTimeChange={handleTimeChange}
                        handleTimeBlur={handleTimeBlur}
                        handleUpdateLine={handleUpdateLine}
                        seekToTimestamp={seekToTimestamp}
                        handleAddLine={handleAddLine}
                        handleDeleteLine={handleDeleteLine}
                        resizeTextarea={resizeTextarea}
                    />
                ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 12, justifyContent: 'end' }}>
                <button className="btn btn-outline btn-sm" onClick={handleSave} disabled={isSaving}>
                    <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* ===== FLOATING VIDEO PLAYER ===== */}
            {driveId && showPreview && (
                <div
                    className="floating-video"
                    style={{
                        position: 'fixed',
                        left: videoPos.x,
                        top: videoPos.y,
                        zIndex: 5000,
                        width: videoWidth,
                        background: '#000',
                        borderRadius: 8,
                        overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                        display: 'flex',
                        flexDirection: 'column',
                        touchAction: 'none',
                    }}
                >
                    <div
                        className="floating-video-header"
                        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
                        onMouseDown={onDragStart}
                        onTouchStart={onDragStart}
                    >
                        <span>🎥 Preview (drag me)</span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <select
                                value={playbackSpeed}
                                onChange={handleSpeedChange}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)', color: '#fff', border: 'none',
                                    borderRadius: '4px', padding: '2px 4px', fontSize: '12px', cursor: 'pointer', outline: 'none'
                                }}
                            >
                                <option value="0.5" style={{ color: '#000' }}>0.5x</option>
                                <option value="0.75" style={{ color: '#000' }}>0.75x</option>
                                <option value="1" style={{ color: '#000' }}>1x</option>
                                <option value="1.25" style={{ color: '#000' }}>1.25x</option>
                                <option value="1.5" style={{ color: '#000' }}>1.5x</option>
                                <option value="2" style={{ color: '#000' }}>2x</option>
                            </select>

                            <button
                                onClick={(e) => { e.stopPropagation(); setShowPreview(false); }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', padding: 0, lineHeight: 1 }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', display: 'flex', backgroundColor: '#000' }}>
                        {isVideoLoading && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 10, color: 'white' }}>
                                <i className="fas fa-spinner fa-spin fa-2x"></i>
                            </div>
                        )}

                        {isPaused && !isVideoLoading && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                zIndex: 5,
                                pointerEvents: 'none'
                            }}>
                                <div style={{
                                    width: '60px', height: '60px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    borderRadius: '50%',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    color: '#000',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    transition: 'all 0.2s ease-in-out'
                                }}>
                                    <i className="fas fa-play fa-2x" style={{ marginLeft: '4px' }}></i>
                                </div>
                            </div>
                        )}

                        <video
                            ref={videoRef}
                            src={`/api/video/preview/${driveId}`}
                            onClick={togglePlayPause}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadStart={() => setIsVideoLoading(true)}
                            onWaiting={() => setIsVideoLoading(true)}
                            onCanPlay={onVideoCanPlay}
                            onPlaying={() => setIsVideoLoading(false)}
                            onPlay={() => setIsPaused(false)}
                            onPause={() => setIsPaused(true)}
                            onError={() => {
                                setIsVideoLoading(false);
                                showAlert("Failed to load video preview. Check the URL or Google Drive sharing settings.", "error");
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer', display: 'block' }}
                        >
                            {subtitleTrackUrl && <track kind="subtitles" src={subtitleTrackUrl} srcLang="id" label="Translated" default />}
                        </video>
                    </div>

                    <div
                        onMouseDown={onResizeStart}
                        onTouchStart={onResizeStart}
                        style={{
                            position: 'absolute', bottom: 0, right: 0,
                            width: '24px', height: '24px', cursor: 'nwse-resize', zIndex: 20,
                            display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', padding: '4px',
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5">
                            <line x1="11" y1="1" x2="1" y2="11" />
                            <line x1="11" y1="6" x2="6" y2="11" />
                        </svg>
                    </div>
                </div>
            )}
        </section>
    );
}