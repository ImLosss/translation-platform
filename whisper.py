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

    if len(sys.argv) < 3:
        emit({
            "type": "error",
            "message": "Usage: python transcribe.py input output.srt"
        })
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    duration = get_duration(input_file)

    emit({
        "type": "start",
        "input": input_file,
        "output": output_file,
        "duration": duration,
        "model": "turbo"
    })

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

    with open(output_file, "w", encoding="utf8") as f:

        for segment in segments:

            f.write(f"{count}\n")
            f.write(
                f"{format_srt_time(segment.start)} --> {format_srt_time(segment.end)}\n"
            )
            f.write(segment.text.strip())
            f.write("\n\n")

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

    emit({
        "type": "done",
        "elapsed": round(time.time() - started, 2),
        "output": output_file,
        "segments": count - 1
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