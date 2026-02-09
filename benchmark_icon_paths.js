const { performance } = require('perf_hooks');

// Simulating React.createElement for JSX
const createElement = (type, props, ...children) => ({ type, props: { ...props, children } });
const Fragment = 'React.Fragment';

function runBenchmark() {
    const iterations = 10_000_000;
    console.log(`Running ${iterations} iterations...`);

    // Case 1: Recreation of Path (Current)
    const startRecreate = performance.now();
    for (let i = 0; i < iterations; i++) {
        // This simulates: <><path d="..."/><polyline points="..."/></>
        const path = createElement(Fragment, null,
            createElement('path', { d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }),
            createElement('polyline', { points: "14 2 14 8 20 8" })
        );
        // Simulate Icon component using it
        const icon = createElement('svg', { path });
    }
    const endRecreate = performance.now();
    const timeRecreate = endRecreate - startRecreate;

    // Case 2: Static Path (Optimized)
    const STATIC_PATH = createElement(Fragment, null,
        createElement('path', { d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }),
        createElement('polyline', { points: "14 2 14 8 20 8" })
    );

    const startStatic = performance.now();
    for (let i = 0; i < iterations; i++) {
        const path = STATIC_PATH;
        const icon = createElement('svg', { path });
    }
    const endStatic = performance.now();
    const timeStatic = endStatic - startStatic;

    console.log(`\n--- Results ---`);
    console.log(`Recreated Path: ${timeRecreate.toFixed(2)}ms`);
    console.log(`Static Path:    ${timeStatic.toFixed(2)}ms`);
    console.log(`Improvement:    ${(timeRecreate / timeStatic).toFixed(2)}x faster`);
    console.log(`Memory Savings: Avoided ${iterations * 3} object allocations.`);
}

runBenchmark();
