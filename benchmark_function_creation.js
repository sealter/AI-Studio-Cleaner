const { performance } = require('perf_hooks');

const json = JSON.stringify({
    chunkedPrompt: {
        chunks: [
            { role: 'model', text: 'Hello, I am a model.' },
            { role: 'user', text: 'Hi, I am a user.' },
            { role: 'model', parts: [{ text: 'Thought process', thought: true }, { text: 'Response' }] }
        ]
    }
});

// The logic from index.html
function getLogic() {
    return (json) => {
        try {
            const data = JSON.parse(json);
            let conversation = [];

            // Handle standard AI Studio export format
            const chunks = data.chunkedPrompt?.chunks || data.chunks || [];

            chunks.forEach((chunk) => {
                const role = chunk.role === 'model' ? 'Model' : 'User';
                let thoughts = [];

                const contentParts = [];

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
}

function runBenchmark() {
    const iterations = 10000;

    console.log(`Running ${iterations} iterations...`);

    // Case 1: Recreated function (Inside Component Simulation)
    // We recreate the function every time we call it
    const startInside = performance.now();
    for (let i = 0; i < iterations; i++) {
        const parseAIStudioJSON = getLogic(); // Simulate creation
        parseAIStudioJSON(json);
    }
    const endInside = performance.now();
    const timeInside = endInside - startInside;

    // Case 2: Static function (Outside Component Simulation)
    // We create the function once
    const parseAIStudioJSON_Static = getLogic();
    const startOutside = performance.now();
    for (let i = 0; i < iterations; i++) {
        parseAIStudioJSON_Static(json);
    }
    const endOutside = performance.now();
    const timeOutside = endOutside - startOutside;

    console.log(`Inside (Recreated): ${timeInside.toFixed(2)}ms`);
    console.log(`Outside (Static): ${timeOutside.toFixed(2)}ms`);
    console.log(`Improvement: ${(timeInside / timeOutside).toFixed(2)}x`);
}

runBenchmark();
