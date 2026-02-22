export default function ProgressBar({ percentage, colorClass = 'bg-budgetly-accent' }) {
    // Ensure percentage is between 0 and 100 for display width
    const width = Math.min(Math.max(percentage, 0), 100);

    return (
        <div className="h-4 w-full bg-budgetly-base/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <div
                className={`h-full ${colorClass} transition-all duration-700 ease-out shadow-[0_0_10px_rgba(204,255,0,0.3)] relative`}
                style={{ width: `${width}%` }}
            >
                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/10 to-white/20" />
            </div>
        </div>
    );
}
