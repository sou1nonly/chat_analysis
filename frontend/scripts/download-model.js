
const fs = require('fs');
const path = require('path');
const https = require('https');

const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
const BASE_URL = `https://huggingface.co/mlc-ai/${MODEL_ID}/resolve/main/`;
const OUT_DIR = path.join(__dirname, '../public/models', MODEL_ID);

const FILES = [
    "ndarray-cache.json",
    "params_shard_0.bin",
    "params_shard_1.bin",
    "mlc-chat-config.json",
    "tokenizer.json",
    "tokenizer_config.json"
];

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log(`Downloading ${MODEL_ID} to ${OUT_DIR}...`);

const downloadFile = (filename) => {
    return new Promise((resolve, reject) => {
        const dest = path.join(OUT_DIR, filename);
        if (fs.existsSync(dest)) {
            console.log(`[SKIP] ${filename} already exists.`);
            resolve();
            return;
        }

        const file = fs.createWriteStream(dest);
        const url = BASE_URL + filename;

        console.log(`[DOWN] ${filename}...`);

        const handleResponse = (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // Follow redirect
                let redirectUrl = response.headers.location;
                if (redirectUrl.startsWith('/')) {
                    redirectUrl = `https://huggingface.co${redirectUrl}`;
                }
                console.log(`[REDIRECT] ${filename} -> ${redirectUrl}`);
                https.get(redirectUrl, handleResponse).on('error', (err) => {
                    fs.unlink(dest, () => reject(err));
                });
            } else if (response.statusCode !== 200) {
                fs.unlink(dest, () => reject(new Error(`Failed to download ${filename}: Status ${response.statusCode}`)));
            } else {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => {
                        console.log(`[DONE] ${filename}`);
                        resolve();
                    });
                });
            }
        };

        https.get(url, handleResponse).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

const main = async () => {
    try {
        for (const file of FILES) {
            await downloadFile(file);
        }
        console.log("All model files downloaded successfully.");
    } catch (error) {
        console.error("Download failed:", error);
        process.exit(1);
    }
};

main();
