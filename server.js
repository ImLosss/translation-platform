import express from 'express';
import PQueue from 'p-queue';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

// Buat folder 'uploads' secara otomatis jika belum ada
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Konfigurasi Multer untuk menyimpan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Konfigurasi P-Queue dengan concurrency: 1
const queue = new PQueue({ concurrency: 1 });
const tasks = new Map();
const PRIVATE_TOKEN = 'IAJDHIAUWDHIAi9fi9shfjiasHNSADIASHID9284039hjios89u9iwr9ui4u890jdifgjmjiopj98';

// Middleware untuk memvalidasi Bearer Token
const requireBearerToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Bearer token is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    if (token !== PRIVATE_TOKEN) {
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }

    next();
};

app.use(requireBearerToken);

/**
 * Fungsi untuk menjalankan skrip Python, memantau JSON, dan menghapus file setelahnya
 */
const runTranscribeProcess = (taskId, inputFile) => {
    return new Promise((resolve) => {
        tasks.set(taskId, {
            id: taskId,
            status: 'processing',
            input: inputFile,
            progress: 0,
            details: {}
        });

        const pythonProcess = spawn('python3', ['whisper.py', inputFile]);
        let stdoutBuffer = '';

        pythonProcess.stdout.on('data', (data) => {
            stdoutBuffer += data.toString();
            const lines = stdoutBuffer.split('\n');
            
            stdoutBuffer = lines.pop();

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const parsedData = JSON.parse(line);
                        const taskData = tasks.get(taskId);
                        
                        if (parsedData.type === 'language') {
                            taskData.language = parsedData.language; 
                            taskData.probability = parsedData.probability;
                            taskData.details = parsedData;
                        } else if (parsedData.type === 'progress') {
                            taskData.progress = parsedData.progress;
                            taskData.details = parsedData;
                        } else if (parsedData.type === 'error') {
                            taskData.status = 'error';
                            taskData.error = parsedData.message;
                        } else if (parsedData.type === 'done') {
                            taskData.status = 'completed';
                            taskData.progress = 100;
                            taskData.details = parsedData; // srt_content ada di dalam sini
                        } else {
                            Object.assign(taskData.details, parsedData);
                        }
                        
                        tasks.set(taskId, taskData);
                    } catch (err) {
                        console.error('Failed to parse Python output line:', line);
                    }
                }
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            console.warn(`[Task ${taskId} STDERR]: ${data.toString()}`);
        });

        pythonProcess.on('close', (code) => {
            const taskData = tasks.get(taskId);
            if (code !== 0 && taskData.status !== 'completed') {
                taskData.status = 'error';
                taskData.error = taskData.error || `Process exited with code ${code}`;
                tasks.set(taskId, taskData);
            }

            // HAPUS FILE OTOMATIS SETELAH PROSES SELESAI / ERROR
            fs.unlink(inputFile, (err) => {
                if (err) {
                    console.error(`[Task ${taskId}] Gagal menghapus file ${inputFile}:`, err.message);
                } else {
                    console.log(`[Task ${taskId}] File ${inputFile} berhasil dihapus.`);
                }
            });

            resolve();
        });
    });
};

/**
 * 1. Endpoint untuk submit tugas audio2srt
 */
app.post('/api/transcribe', upload.single('media_file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'File media_file wajib diunggah!' });
    }

    const taskId = uuidv4();
    const input_file = req.file.path; 

    tasks.set(taskId, {
        id: taskId,
        status: 'queued',
        input: input_file,
        progress: 0,
        details: {}
    });

    queue.add(() => runTranscribeProcess(taskId, input_file));

    res.status(202).json({
        message: 'File successfully uploaded and task added to queue',
        taskId: taskId
    });
});

/**
 * 2. Endpoint untuk cek status antrian
 */
app.get('/api/queue-status', (req, res) => {
    res.json({
        processing: queue.pending,
        queued: queue.size
    });
});

/**
 * 3. Endpoint untuk cek status permintaan spesifik
 */
app.get('/api/task/:id', (req, res) => {
    const { id } = req.params;
    const task = tasks.get(id);

    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
});

const PORT = 7777;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Requires Bearer token: ${PRIVATE_TOKEN}`);
});