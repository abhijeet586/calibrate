"use client";

export function ScoreWidget({ score = 0 }: { score?: number }) {
    const circumference = 2 * Math.PI * 70; // radius = 70
    // Ensure score is valid to prevent weird SVG offsets
    const safeScore = Math.max(0, Math.min(100, isNaN(score) ? 0 : score));
    const offset = circumference - (safeScore / 100) * circumference;

    return (
        <div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
            <h3 className="mb-6 text-sm font-medium text-gray-400">Market Readiness Score</h3>

            <div className="flex flex-col items-center">
                {/* Circular Progress */}
                <div className="relative h-40 w-40">
                    <svg className="h-full w-full -rotate-90 transform">
                        {/* Background circle */}
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-zinc-800"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="text-cyan-400 transition-all duration-1000"
                        />
                    </svg>
                    {/* Score text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">{Math.round(safeScore)}%</span>
                    </div>
                </div>

                <p className="mt-4 text-center text-sm text-gray-400">
                    You are top <span className="text-cyan-400 font-semibold">15%</span> of your batch
                </p>



            </div>
        </div>
    );
}
