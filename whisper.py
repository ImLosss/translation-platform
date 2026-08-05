import sys
import json
import time
import subprocess

from faster_whisper import WhisperModel


def emit(data):
    print(json.dumps(data, ensure_ascii=False), flush=True)


def get_duration(path):
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            path,
        ],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise Exception("Unable to read media duration.")

    return float(json.loads(result.stdout)["format"]["duration"])


def format_srt_time(seconds):
    ms = int(round((seconds % 1) * 1000))
    total = int(seconds)

    s = total % 60
    m = (total // 60) % 60
    h = total // 3600

    return f"{h:02}:{m:02}:{s:02},{ms:03}"


try:

    if len(sys.argv) < 2:
        emit({
            "type": "error",
            "message": "Usage: python whisper.py input_file.mp4"
        })
        sys.exit(1)

    input_file = sys.argv[1]

    duration = get_duration(input_file)

    emit({
        "type": "start",
        "input": input_file,
        "duration": duration,
        "model": "turbo"
    })

    # Inisialisasi model
    model = WhisperModel(
        "turbo",
        device="cpu",
        compute_type="int8",
    )

    started = time.time()

    segments, info = model.transcribe(
        input_file,
        beam_size=5,
        vad_filter=True,
        word_timestamps=False,
    )

    emit({
        "type": "language",
        "language": info.language,
        "probability": round(info.language_probability, 4)
    })

    count = 1
    srt_content = "" # Variabel penampung hasil teks SRT

    for segment in segments:
        
        # Masukkan format teks SRT ke dalam variabel string
        srt_content += f"{count}\n"
        srt_content += f"{format_srt_time(segment.start)} --> {format_srt_time(segment.end)}\n"
        srt_content += f"{segment.text.strip()}\n\n"

        progress = min(segment.end / duration * 100, 100)
        elapsed = time.time() - started
        eta = 0

        if progress > 0:
            eta = elapsed * (100 - progress) / progress

        emit({
            "type": "progress",
            "progress": round(progress, 2),
            "elapsed": round(elapsed, 2),
            "eta": round(eta, 2),
            "segment": count,
            "start": round(segment.start, 3),
            "end": round(segment.end, 3),
            "text": segment.text.strip()
        })

        count += 1

    # Mengirimkan srt_content ketika proses selesai
    emit({
        "type": "done",
        "elapsed": round(time.time() - started, 2),
        "segments": count - 1,
        "srt_content": srt_content
    })

except KeyboardInterrupt:

    emit({
        "type": "cancelled"
    })

    sys.exit(130)

except Exception as e:

    emit({
        "type": "error",
        "message": str(e)
    })

    sys.exit(1)