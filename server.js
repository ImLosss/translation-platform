import express from 'express';
import PQueue from 'p-queue';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer'; 
import fs from 'fs';      
import path from 'path';     

const app = express();
app.use(express.json());

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Beri nama unik: timestamp + ekstensi asli
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Konfigurasi P-Queue dengan concurrency: 1 (hanya 1 proses berjalan dalam satu waktu)
const queue = new PQueue({ concurrency: 1 });

// Penyimpanan in-memory untuk status tugas (bisa diganti Redis/DB jika butuh persisten)
const tasks = new Map();

// Konfigurasi Token (Ganti dengan token rahasia Anda)
const PRIVATE_TOKEN = 'hnoidwaiuddaw89u38945982wj9ijiDJIOoaAIODHAjdjaoi';

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

// Pasang middleware ke semua endpoint
app.use(requireBearerToken);

/**
 * Fungsi pembantu untuk menjalankan skrip Python dan memantau output JSON-nya
 */
const runTranscribeProcess = (taskId, inputFile, outputFile) => {
    return new Promise((resolve, reject) => {
        tasks.set(taskId, {
            id: taskId,
            status: 'processing',
            input: inputFile,
            progress: 0,
            details: {}
        });

        const pythonProcess = spawn('python3', ['whisper.py', inputFile]);
        let stdoutBuffer = '';

        // Menangani output dari Python (JSON baris demi baris)
        pythonProcess.stdout.on('data', (data) => {
            stdoutBuffer += data.toString();
            const lines = stdoutBuffer.split('\n');
            
            // Simpan bagian terakhir yang mungkin belum selesai ke dalam buffer
            stdoutBuffer = lines.pop();

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const parsedData = JSON.parse(line);
                        const taskData = tasks.get(taskId);
                        
                        // Update status berdasarkan event dari Python
                        if (parsedData.type === 'progress') {
                            taskData.progress = parsedData.progress;
                            taskData.details = parsedData;
                        } else if (parsedData.type === 'error') {
                            taskData.status = 'error';
                            taskData.error = parsedData.message;
                        } else if (parsedData.type === 'done') {
                            taskData.status = 'completed';
                            taskData.progress = 100;
                            taskData.details = parsedData;
                        } else {
                            // Event lain seperti 'start', 'language'
                            Object.assign(taskData.details, parsedData);
                        }
                        
                        tasks.set(taskId, taskData);
                    } catch (err) {
                        console.error('Failed to parse Python output line:', line);
                    }
                }
            }
        });

        // Menangani peringatan atau error dari stderr (opsional)
        pythonProcess.stderr.on('data', (data) => {
            console.warn(`[Task ${taskId} STDERR]: ${data.toString()}`);
        });

        // Menangani proses selesai
        pythonProcess.on('close', (code) => {
            const taskData = tasks.get(taskId);
            if (code !== 0 && taskData.status !== 'completed') {
                taskData.status = 'error';
                taskData.error = taskData.error || `Process exited with code ${code}`;
                tasks.set(taskId, taskData);
                resolve(); // Tetap resolve agar antrian p-queue terus berjalan
            } else {
                resolve();
            }
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

    // Panggil antrian tanpa parameter output_file
    queue.add(() => runTranscribeProcess(taskId, input_file));

    res.status(202).json({
        message: 'File successfully uploaded and task added to queue',
        taskId: taskId
    });
});

/**
 * 2. Endpoint untuk cek status antrian global (berapa yang diproses & mengantri)
 */
app.get('/api/queue-status', (req, res) => {
    res.json({
        processing: queue.pending, // Jumlah task yang sedang dikerjakan saat ini (maksimal 1)
        queued: queue.size         // Jumlah task yang sedang menunggu dalam antrian
    });
});

/**
 * 3. Endpoint untuk cek status permintaan spesifik berdasarkan ID
 */
app.get('/api/task/:id', (req, res) => {
    const { id } = req.params;
    const task = tasks.get(id);

    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
});

// Jalankan Server
const PORT = 7777;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Requires Bearer token: ${PRIVATE_TOKEN}`);
});