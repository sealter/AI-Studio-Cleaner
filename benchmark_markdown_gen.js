const { performance } = require('perf_hooks');

// Mock Data Generation
function generateData(fileCount, msgsPerFile) {
    const parsedData = [];
    for (let i = 0; i < fileCount; i++) {
        const conversation = [];
        for (let j = 0; j < msgsPerFile; j++) {
            conversation.push({
                role: j % 2 === 0 ? 'User' : 'Model',
                content: "This is some sample content for the message. ".repeat(10),
                thoughts: "Thinking about the answer...\nStep 1: Analyze\nStep 2: Solve".repeat(5),
                hasThoughts: true
            });
        }
        parsedData.push({ name: `file_${i}.json`, conversation, error: false });
    }
    return parsedData;
}

// 1. Slow: String Concatenation
function generateMarkdown_Slow(parsedData, includeThoughts) {
    let combinedMarkdown = "";
    parsedData.forEach(({ name, conversation, error }) => {
        if (error) {
            combinedMarkdown += `> ⚠️ Error parsing file: ${name}\n\n`;
            return;
        }

        combinedMarkdown += `# Source: ${name}\n\n`;

        conversation.forEach(msg => {
            const roleIcon = msg.role === 'User' ? '👤' : '🤖';
            let thoughtBlock = "";

            if (includeThoughts && msg.hasThoughts) {
                const indentedThoughts = msg.thoughts.split('\n').map(line => `> ${line}`).join('\n');
                thoughtBlock = `> **🧠 Thinking Process**\n> \n${indentedThoughts}\n\n`;
            }

            combinedMarkdown += `${thoughtBlock}## ${roleIcon} ${msg.role}\n\n${msg.content}\n\n---\n\n`;
        });
    });
    return combinedMarkdown;
}

// 2. Fast: Array Push + Join (Current Implementation)
function generateMarkdown_Fast(parsedData, includeThoughts) {
    const parts = [];

    parsedData.forEach(({ name, conversation, error }) => {
        if (error) {
            parts.push(`> ⚠️ Error parsing file: ${name}\n\n`);
            return;
        }

        parts.push(`# Source: ${name}\n\n`);

        conversation.forEach(msg => {
            const roleIcon = msg.role === 'User' ? '👤' : '🤖';
            let thoughtBlock = "";

            if (includeThoughts && msg.hasThoughts) {
                const indentedThoughts = msg.thoughts.split('\n').map(line => `> ${line}`).join('\n');
                thoughtBlock = `> **🧠 Thinking Process**\n> \n${indentedThoughts}\n\n`;
            }

            parts.push(`${thoughtBlock}## ${roleIcon} ${msg.role}\n\n${msg.content}\n\n---\n\n`);
        });
    });

    return parts.join('');
}


function runBenchmark() {
    console.log("Generating Data (Medium - 200k msgs)...");
    const parsedData = generateData(20, 10000);
    const includeThoughts = true;
    console.log("Data Generated.");

    // Measure Slow
    try {
        const startSlow = performance.now();
        generateMarkdown_Slow(parsedData, includeThoughts);
        const endSlow = performance.now();
        console.log(`Slow (String Concat): ${(endSlow - startSlow).toFixed(2)}ms`);
    } catch (e) {
        console.log(`Slow (String Concat) Failed: ${e.message}`);
    }

    // Measure Fast
    try {
        const startFast = performance.now();
        generateMarkdown_Fast(parsedData, includeThoughts);
        const endFast = performance.now();
        console.log(`Fast (Array Join): ${(endFast - startFast).toFixed(2)}ms`);
    } catch (e) {
        console.log(`Fast (Array Join) Failed: ${e.message}`);
    }
}

runBenchmark();
