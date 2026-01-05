const fs = require('fs');
const path = require('path');

const MODEL_DIR = path.join(__dirname, '../public/models/Qwen2.5-0.5B-Instruct-q4f16_1-MLC');
const CACHE_FILE = path.join(MODEL_DIR, 'ndarray-cache.json');

console.log(`Scanning directory: ${MODEL_DIR}`);

if (!fs.existsSync(MODEL_DIR)) {
    console.error("Model directory not found!");
    process.exit(1);
}

const files = fs.readdirSync(MODEL_DIR);
const records = [];

files.forEach(file => {
    if (file === 'ndarray-cache.json') return; // Skip self

    // WebLLM needs params shards and tokenizer configs in the cache manifest
    // It filters by what it needs, but it's safe to list all relevant files.
    if (file.endsWith('.bin') || file.endsWith('.json')) {
        const filePath = path.join(MODEL_DIR, file);
        const stats = fs.statSync(filePath);
        records.push({
            name: file,
            size: stats.size
        });
        console.log(`Added ${file} (${stats.size} bytes)`);
    }
});

const cacheManifest = {
    records: records
};

fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheManifest, null, 4));
console.log(`\nSuccessfully regenerated ndarray-cache.json with ${records.length} files.`);
