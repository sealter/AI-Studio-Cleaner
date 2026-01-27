const { performance } = require('perf_hooks');

// Original implementation
const parseAIStudioJSON_Original = (json) => {
    try {
        const data = JSON.parse(json);
        let conversation = [];

        const chunks = data.chunkedPrompt?.chunks || data.chunks || [];

        chunks.forEach((chunk) => {
            const role = chunk.role === 'model' ? 'Model' : 'User';
            let thoughts = [];
            let contentParts = [];

            if (chunk.text) {
                contentParts.push(chunk.text);
            }

            if (chunk.parts && Array.isArray(chunk.parts)) {
                chunk.parts.forEach(part => {
                    if (part.thought || part.isThought) {
                        thoughts.push(part.text);
                    } else if (part.text) {
                        contentParts.push(part.text);
                    }
                });
            }

            const content = contentParts.join('');

            if (content.trim() || thoughts.length > 0) {
                conversation.push({
                    role,
                    content: content.trim(),
                    thoughts: thoughts.join('\n\n'),
                    hasThoughts: thoughts.length > 0
                });
            }
        });

        return conversation;
    } catch (e) {
        console.error("Parse Error", e);
        return null;
    }
};

// Optimized implementation
const parseAIStudioJSON_Optimized = (json) => {
    try {
        const data = JSON.parse(json);
        let conversation = [];

        const chunks = data.chunkedPrompt?.chunks || data.chunks || [];

        chunks.forEach((chunk) => {
            const role = chunk.role === 'model' ? 'Model' : 'User';
            let thoughts = [];
            let contentParts = [];

            if (chunk.text) {
                contentParts.push(chunk.text);
            }

            if (chunk.parts && Array.isArray(chunk.parts)) {
                chunk.parts.forEach(part => {
                    if (part.thought || part.isThought) {
                        thoughts.push(part.text);
                    } else if (part.text) {
                        contentParts.push(part.text);
                    }
                });
            }

            const content = contentParts.join('');

            if (content.trim() || thoughts.length > 0) {
                conversation.push({
                    role,
                    content: content.trim(),
                    thoughts: thoughts.join('\n\n'),
                    hasThoughts: thoughts.length > 0
                });
            }
        });

        return conversation;
    } catch (e) {
        console.error("Parse Error", e);
        return null;
    }
};

function generateLargeData() {
    const chunks = [];
    // 1 chunk, 100000 parts
    const largeText = "A";
    for (let i = 0; i < 1; i++) {
        const parts = [];
        for (let j = 0; j < 100000; j++) {
            parts.push({ text: `Part ${j} ${largeText}` });
        }
        chunks.push({
            role: i % 2 === 0 ? 'user' : 'model',
            parts: parts
        });
    }
    return JSON.stringify({ chunks });
}

function runBenchmark() {
    console.log("Generating data...");
    const jsonData = generateLargeData();
    console.log("Data generated. Size: " + (jsonData.length / 1024 / 1024).toFixed(2) + " MB");

    // Warmup
    parseAIStudioJSON_Original(jsonData);
    parseAIStudioJSON_Optimized(jsonData);

    console.log("Running Original...");
    const startOriginal = performance.now();
    const resultOriginal = parseAIStudioJSON_Original(jsonData);
    const endOriginal = performance.now();
    const timeOriginal = endOriginal - startOriginal;
    console.log(`Original Time: ${timeOriginal.toFixed(2)}ms`);

    console.log("Running Optimized...");
    const startOptimized = performance.now();
    const resultOptimized = parseAIStudioJSON_Optimized(jsonData);
    const endOptimized = performance.now();
    const timeOptimized = endOptimized - startOptimized;
    console.log(`Optimized Time: ${timeOptimized.toFixed(2)}ms`);

    console.log(`Improvement: ${(timeOriginal / timeOptimized).toFixed(2)}x speedup`);

    // Correctness Check
    const originalStr = JSON.stringify(resultOriginal);
    const optimizedStr = JSON.stringify(resultOptimized);
    if (originalStr === optimizedStr) {
        console.log("✅ Verification Passed: Outputs are identical.");
    } else {
        console.error("❌ Verification Failed: Outputs differ!");
    }
}

runBenchmark();
