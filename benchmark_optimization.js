const { performance } = require('perf_hooks');

// Legacy Implementation (forEach based, from previous benchmark)
const parseAIStudioJSON_Legacy = (json) => {
    try {
        const data = JSON.parse(json);
        let conversation = [];

        const chunks = data.chunkedPrompt?.chunks || data.chunks || [];

        chunks.forEach((chunk) => {
            const role = chunk.role === 'model' ? 'Model' : 'User';
            let thoughts = [];
            let contentParts = [];

            if (chunk.parts && Array.isArray(chunk.parts) && chunk.parts.length > 0) {
                chunk.parts.forEach(part => {
                    if (part.thought || part.isThought) {
                        thoughts.push(part.text);
                    } else if (part.text) {
                        contentParts.push(part.text);
                    }
                });
            } else if (chunk.text) {
                contentParts.push(chunk.text);
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

// Current Implementation (v1.2.28 Logic)
const parseAIStudioJSON_Current = (json) => {
    try {
        const data = JSON.parse(json);
        if (!data || typeof data !== 'object') return null;

        let conversation = [];

        // Helper to extract content and thoughts from any message object (chunk or systemInstruction)
        const extractContent = (item) => {
            let thoughts = [];
            let contentParts = [];

            if (item.parts && Array.isArray(item.parts) && item.parts.length > 0) {
                for (const part of item.parts) {
                    if (!part || typeof part !== 'object') continue;

                    if (part.thought || part.isThought) {
                        let t = part.text;
                        if ((t === undefined || t === null) && typeof part.thought === 'string') t = part.thought;
                        const trimmed = (t !== undefined && t !== null ? String(t) : '').trim();
                        if (trimmed) {
                            thoughts.push(trimmed);
                        }
                    } else if (part.text !== undefined && part.text !== null) {
                        contentParts.push(part.text);
                    }
                }
            } else if (item.text !== undefined && item.text !== null) {
                // Fallback to top-level text if parts are missing
                contentParts.push(item.text);
            }

            const content = contentParts.join('').trim();
            const thoughtsStr = thoughts.join('\n\n');
            const hasThoughts = thoughts.length > 0;

            return {
                content,
                thoughts: thoughtsStr,
                hasThoughts,
                isValid: (content.length > 0 || hasThoughts)
            };
        };

        // Handle System Instruction (often at root or inside chunkedPrompt)
        const sysInstruction = data.systemInstruction || data.chunkedPrompt?.systemInstruction;
        if (sysInstruction) {
            const { content, thoughts, hasThoughts, isValid } = extractContent(sysInstruction);
            if (isValid) {
                conversation.push({
                    role: 'System',
                    content,
                    thoughts,
                    hasThoughts
                });
            }
        }

        // Handle standard AI Studio export format
        let chunks = data.chunkedPrompt?.chunks || data.chunks;
        if (!Array.isArray(chunks)) chunks = [];

        for (const chunk of chunks) {
            if (!chunk || typeof chunk !== 'object') continue;

            // Enhance role detection: Map 'system' to 'System', 'model' to 'Model', others to 'User'
            let role = 'User';
            if (chunk.role === 'model') role = 'Model';
            else if (chunk.role === 'system') role = 'System';

            const { content, thoughts, hasThoughts, isValid } = extractContent(chunk);

            if (isValid) {
                conversation.push({
                    role,
                    content,
                    thoughts,
                    hasThoughts
                });
            }
        }

        return conversation;
    } catch (e) {
        return null;
    }
};

function generateLargeData() {
    const chunks = [];
    // 1 chunk, 1,000,000 parts to stress test
    const largeText = "A";
    for (let i = 0; i < 1; i++) {
        const parts = [];
        for (let j = 0; j < 1000000; j++) {
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
    try {
        parseAIStudioJSON_Legacy(jsonData);
        parseAIStudioJSON_Current(jsonData);
    } catch (e) {
        // Ignore warmup errors
    }

    console.log("Running Legacy (forEach)...");
    const startLegacy = performance.now();
    const resultLegacy = parseAIStudioJSON_Legacy(jsonData);
    const endLegacy = performance.now();
    const timeLegacy = endLegacy - startLegacy;
    console.log(`Legacy Time: ${timeLegacy.toFixed(2)}ms`);

    console.log("Running Current (for...of)...");
    const startCurrent = performance.now();
    const resultCurrent = parseAIStudioJSON_Current(jsonData);
    const endCurrent = performance.now();
    const timeCurrent = endCurrent - startCurrent;
    console.log(`Current Time: ${timeCurrent.toFixed(2)}ms`);

    console.log(`Improvement: ${(timeLegacy / timeCurrent).toFixed(2)}x speedup`);

    // Correctness Check
    if (resultLegacy && resultCurrent) {
        const legacyStr = JSON.stringify(resultLegacy);
        const currentStr = JSON.stringify(resultCurrent);
        if (legacyStr === currentStr) {
            console.log("✅ Verification Passed: Outputs are identical.");
        } else {
            console.error("⚠️ Verification Warning: Outputs differ (Expected, due to logic enhancements in Current).");
            // Inspect first difference? No, too large.
        }
    } else {
        console.error("❌ One of the runs failed.");
    }
}

runBenchmark();
