const { performance } = require('perf_hooks');

function generateThoughts(lines, lineLength) {
    const line = 'a'.repeat(lineLength);
    return Array(lines).fill(line).join('\n');
}

// Prepare data
const lines = 1000;
const lineLength = 50;
const thoughts = generateThoughts(lines, lineLength);
const iterations = 10000;

console.log(`Benchmarking with ${lines} lines of length ${lineLength}, over ${iterations} iterations.`);

// Old implementation
function oldImpl(text) {
    return text.split('\n').map(line => `> ${line}`).join('\n');
}

// New implementation
function newImpl(text) {
    return '> ' + text.replace(/\n/g, '\n> ');
}

// Verify correctness first
const outOld = oldImpl(thoughts);
const outNew = newImpl(thoughts);
if (outOld !== outNew) {
    console.error("Mismatch in output!");
    console.log("Old length:", outOld.length);
    console.log("New length:", outNew.length);
    // process.exit(1);
    // Commented out exit to allow seeing perf anyway, but this is critical.
} else {
    console.log("Outputs match.");
}

// Measure Old
const startOld = performance.now();
for (let i = 0; i < iterations; i++) {
    oldImpl(thoughts);
}
const endOld = performance.now();
const timeOld = endOld - startOld;

// Measure New
const startNew = performance.now();
for (let i = 0; i < iterations; i++) {
    newImpl(thoughts);
}
const endNew = performance.now();
const timeNew = endNew - startNew;

console.log(`Old Implementation: ${timeOld.toFixed(2)}ms`);
console.log(`New Implementation: ${timeNew.toFixed(2)}ms`);
console.log(`Improvement: ${(timeOld / timeNew).toFixed(2)}x speedup`);
