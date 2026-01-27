const { performance } = require('perf_hooks');

// Simulation of the Component Props
const props = {
    children: "Click me",
    onClick: () => {},
    variant: "primary",
    className: "extra-class",
    disabled: false
};

// Case A: Variants inside (Current)
const ButtonOriginal = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform active:scale-95",
        secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
        danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
        ghost: "hover:bg-slate-100 text-slate-600"
    };
    // Simulate return
    return `${baseStyle} ${variants[variant]} ${className}`;
};

// Case B: Variants outside (Optimized)
const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform active:scale-95",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
    ghost: "hover:bg-slate-100 text-slate-600"
};

const ButtonOptimized = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    return `${baseStyle} ${variants[variant]} ${className}`;
};

function runBenchmark() {
    const ITERATIONS = 10_000_000;

    // Warmup
    for(let i=0; i<1000; i++) {
        ButtonOriginal(props);
        ButtonOptimized(props);
    }

    console.log(`Running ${ITERATIONS} iterations...`);

    const startOriginal = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        ButtonOriginal(props);
    }
    const endOriginal = performance.now();
    const timeOriginal = endOriginal - startOriginal;
    console.log(`Original Time: ${timeOriginal.toFixed(2)}ms`);

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        ButtonOptimized(props);
    }
    const endOptimized = performance.now();
    const timeOptimized = endOptimized - startOptimized;
    console.log(`Optimized Time: ${timeOptimized.toFixed(2)}ms`);

    console.log(`Improvement: ${(timeOriginal / timeOptimized).toFixed(2)}x speedup`);
}

runBenchmark();
