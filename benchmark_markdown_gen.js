const { performance } = require('perf_hooks');

// Mock Data Generation
function generateData(fileCount, msgsPerFile) {
    const parsedData = [];
    for (let i = 0; i < fileCount; i++) {
        const conversation = [];
        for (let j = 0; j < msgsPerFile; j++) {
            conversation.push({
                role: j % 2 === 0 ? 'User' : 'Model',
                content: "This is some sample content for the message. ".repeat(2),
                thoughts: "Thinking about the answer...\nStep 1: Analyze\nStep 2: Solve",
                hasThoughts: true
            });
        }
        parsedData.push({ name: `file_${i}.json`, conversation, error: false });
    }
    return parsedData;
}

// 1. Legacy: Template Literal Pushes (v1.2.2)
function generateMarkdown_Legacy(parsedData, includeThoughts) {
    const parts = [];

    parsedData.forEach(({ name, conversation, error }) => {
        if (error) {
            parts.push(`> ⚠️ Error parsing file: ${name}\n\n`);
            return;
        }

        parts.push(`# Source: ${name}\n\n`);

        conversation.forEach(msg => {
            const roleIcon = msg.role === 'User' ? '👤' : '🤖';

            if (includeThoughts && msg.hasThoughts) {
                // Optimization: replace is ~2.8x faster than split/map/join
                const indentedThoughts = '> ' + msg.thoughts.replace(/\n/g, '\n> ');
                parts.push('> **🧠 Thinking Process**\n> \n', indentedThoughts, '\n\n');
            }

            parts.push('## ', roleIcon, ' ', msg.role, '\n\n', msg.content, '\n\n---\n\n');
        });
    });

    return parts.join('');
}

// 2. Current: Granular Array Pushes (v1.2.3)
function generateMarkdown_Current(parsedData, includeThoughts) {
    const parts = [];

    parsedData.forEach(({ name, conversation, error }) => {
        if (error) {
            parts.push('> ⚠️ Error parsing file: ', name, '\n\n');
            return;
        }

        parts.push('# Source: ', name, '\n\n');

        conversation.forEach(msg => {
            const roleIcon = msg.role === 'User' ? '👤' : '🤖';

            if (includeThoughts && msg.hasThoughts) {
                const indentedThoughts = '> ' + msg.thoughts.replace(/\n/g, '\n> ');
                parts.push('> **🧠 Thinking Process**\n> \n', indentedThoughts, '\n\n');
            }

            parts.push('## ', roleIcon, ' ', msg.role, '\n\n', msg.content, '\n\n---\n\n');
        });
    });

    return parts.join('');
}


function runBenchmark() {
    console.log("Generating Data (50,000 files, 5 msgs/file)...");
    const parsedData = generateData(50000, 5);
    const includeThoughts = true;
    console.log("Data Generated.");

    // Warmup
    generateMarkdown_Legacy(parsedData.slice(0, 100), includeThoughts);
    generateMarkdown_Current(parsedData.slice(0, 100), includeThoughts);

    // Measure Legacy
    try {
        const startLegacy = performance.now();
        generateMarkdown_Legacy(parsedData, includeThoughts);
        const endLegacy = performance.now();
        console.log(`Legacy (Template Literal): ${(endLegacy - startLegacy).toFixed(2)}ms`);
    } catch (e) {
        console.log(`Legacy Failed: ${e.message}`);
    }

    // Measure Current
    try {
        const startCurrent = performance.now();
        generateMarkdown_Current(parsedData, includeThoughts);
        const endCurrent = performance.now();
        console.log(`Current (Granular Push):   ${(endCurrent - startCurrent).toFixed(2)}ms`);
    } catch (e) {
        console.log(`Current Failed: ${e.message}`);
    }
}

runBenchmark();
