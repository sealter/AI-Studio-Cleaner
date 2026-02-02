
// benchmark_react_memo.js
//
// Purpose: Demonstrate the performance impact of passing stable vs. unstable children to React.memo components.
//
// In React, <Component /> calls create new objects (elements) every time.
// If these are passed as children to a memoized component, strict referential equality checks fail,
// causing the memoized component to re-render unnecessarily.
//
// This script simulates React's shallow comparison logic to quantify the "work" saved.

const { performance } = require('perf_hooks');

// --- Mock React Internals ---

const React = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),

    // Simulates React.memo shallow comparison
    memo: (Component, areEqual) => {
        return {
            type: Component,
            compare: (prevProps, nextProps) => {
                if (areEqual) return areEqual(prevProps, nextProps);

                // Default Shallow Compare
                if (prevProps === nextProps) return true;
                if (typeof prevProps !== 'object' || prevProps === null || typeof nextProps !== 'object' || nextProps === null) return false;

                const keysA = Object.keys(prevProps);
                const keysB = Object.keys(nextProps);
                if (keysA.length !== keysB.length) return false;

                for (let key of keysA) {
                    if (prevProps[key] !== nextProps[key]) {
                        return false;
                    }
                }
                return true;
            }
        };
    }
};

const Icon = () => React.createElement('svg', {});
const Button = () => "Rendered Button";
const MemoButton = React.memo(Button);

// --- Benchmark ---

function runBenchmark() {
    const ITERATIONS = 1_000_000;
    console.log(`Running ${ITERATIONS} iterations...`);

    // Scenario 1: Unstable Children (Original Issue)
    // <Button><Icon /> Clear</Button> -> Children is new object every time
    let rendersUnstable = 0;
    const startUnstable = performance.now();

    // Initial Props
    let prevProps = {
        onClick: () => {}, // stable fn for sim
        children: [React.createElement(Icon, {}), " Clear"]
    };

    for (let i = 0; i < ITERATIONS; i++) {
        // Parent re-renders, creating new children
        const nextProps = {
            onClick: prevProps.onClick,
            children: [React.createElement(Icon, {}), " Clear"]
        };

        // React checks if it should re-render
        if (!MemoButton.compare(prevProps, nextProps)) {
            rendersUnstable++;
        }
        prevProps = nextProps;
    }
    const endUnstable = performance.now();


    // Scenario 2: Stable Children (Optimization)
    // const content = <><Icon /> Clear</>; -> Content is created once
    // <Button>{content}</Button>
    let rendersStable = 0;
    const startStable = performance.now();

    const staticContent = [React.createElement(Icon, {}), " Clear"];

    // Initial Props
    prevProps = {
        onClick: () => {},
        children: staticContent
    };

    for (let i = 0; i < ITERATIONS; i++) {
        // Parent re-renders, but children prop refers to same object
        const nextProps = {
            onClick: prevProps.onClick,
            children: staticContent
        };

        if (!MemoButton.compare(prevProps, nextProps)) {
            rendersStable++;
        }
        prevProps = nextProps;
    }
    const endStable = performance.now();

    // --- Results ---

    console.log('\n--- Results ---');
    console.log(`Unstable Children (Original): ${rendersUnstable} re-renders`);
    console.log(`Stable Children (Optimized):  ${rendersStable} re-renders`);

    console.log(`\nSimulation Overhead (Comparison Cost):`);
    console.log(`Unstable Time: ${(endUnstable - startUnstable).toFixed(2)}ms`);
    console.log(`Stable Time:   ${(endStable - startStable).toFixed(2)}ms`);

    console.log(`\nIMPACT: ${((rendersUnstable - rendersStable) / rendersUnstable * 100).toFixed(1)}% reduction in re-renders.`);
}

runBenchmark();
