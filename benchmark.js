const { performance } = require('perf_hooks');

// Mock Data Processing
const parseAIStudioJSON = (text) => {
    // Simulate CPU work (parsing)
    return { mock: "data", textLength: text.length };
};

// Mock File
class MockFile {
    constructor(name, content) {
        this.name = name;
        this.content = content;
    }
    async text() {
        // Simulate I/O delay (e.g., reading large file)
        // 50ms delay per file
        await new Promise(resolve => setTimeout(resolve, 50));
        return this.content;
    }
}

// Optimized Implementation (formerly Sequential)
async function handleFilesOptimized(files) {
    const promises = files.map(async (file) => {
        try {
            const text = await file.text();
            const conversation = parseAIStudioJSON(text);
            return { name: file.name, conversation, error: !conversation };
        } catch (e) {
            return { name: file.name, error: true };
        }
    });
    return Promise.all(promises);
}

// Concurrent Implementation (Optimized Code)
async function handleFilesConcurrent(files) {
    // We map over files to create an array of promises
    const promises = files.map(async (file) => {
        try {
            const text = await file.text();
            const conversation = parseAIStudioJSON(text);
            return { name: file.name, conversation, error: !conversation };
        } catch (e) {
            return { name: file.name, error: true };
        }
    });

    // Wait for all promises to resolve
    return Promise.all(promises);
}

async function run() {
    console.log("Starting Benchmark...");

    // Create 50 mock files
    const fileCount = 50;
    const files = Array.from({ length: fileCount }, (_, i) => new MockFile(`file${i}.json`, `{"some": "json content"}`));

    // Test Optimized
    const startSeq = performance.now();
    await handleFilesOptimized(files);
    const endSeq = performance.now();
    const seqTime = (endSeq - startSeq).toFixed(2);
    console.log(`Optimized processing of ${fileCount} files: ${seqTime}ms`);

    // Test Concurrent
    const startConc = performance.now();
    await handleFilesConcurrent(files);
    const endConc = performance.now();
    const concTime = (endConc - startConc).toFixed(2);
    console.log(`Concurrent processing of ${fileCount} files: ${concTime}ms`);

    // Calculate Improvement
    const speedup = (parseFloat(seqTime) / parseFloat(concTime)).toFixed(2);
    console.log(`Speedup (Optimized vs Concurrent): ${speedup}x`);
}

run();
