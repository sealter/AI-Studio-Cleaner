const { performance } = require('perf_hooks');

// Simulation of the Component Props
const props = {
    children: "Click me",
    onClick: () => {},
    variant: "primary",
    className: "extra-class",
    disabled: false
};

// Case A: Variants inside (Hypothetical "Bad" state from prompt description)
const ButtonBad = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform active:scale-95",
        secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
        danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
        ghost: "hover:bg-slate-100 text-slate-600"
    };
    return `${baseStyle} ${variants[variant]} ${className}`;
};

// Case B: Variants outside, BaseStyle inside (Current state of repo)
const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform active:scale-95",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
    ghost: "hover:bg-slate-100 text-slate-600"
};

const ButtonCurrent = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    return `${baseStyle} ${variants[variant]} ${className}`;
};

// Case C: Both outside (Target state)
const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

const ButtonOptimized = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
    return `${baseStyle} ${variants[variant]} ${className}`;
};

function runBenchmark() {
    const ITERATIONS = 10_000_000;

    // Warmup
    for(let i=0; i<1000; i++) {
        ButtonBad(props);
        ButtonCurrent(props);
        ButtonOptimized(props);
    }

    console.log(`Running ${ITERATIONS} iterations...`);

    const startBad = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        ButtonBad(props);
    }
    const endBad = performance.now();
    const timeBad = endBad - startBad;
    console.log(`Bad (Variants inside): ${timeBad.toFixed(2)}ms`);

    const startCurrent = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        ButtonCurrent(props);
    }
    const endCurrent = performance.now();
    const timeCurrent = endCurrent - startCurrent;
    console.log(`Current (Variants outside, BaseStyle inside): ${timeCurrent.toFixed(2)}ms`);

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        ButtonOptimized(props);
    }
    const endOptimized = performance.now();
    const timeOptimized = endOptimized - startOptimized;
    console.log(`Optimized (Both outside): ${timeOptimized.toFixed(2)}ms`);

    console.log(`Improvement Current vs Bad: ${(timeBad / timeCurrent).toFixed(2)}x`);
    console.log(`Improvement Optimized vs Current: ${(timeCurrent / timeOptimized).toFixed(2)}x`);
    console.log(`Total Improvement: ${(timeBad / timeOptimized).toFixed(2)}x`);
}

runBenchmark();
