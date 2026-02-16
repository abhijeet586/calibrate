"use client";

export function ScoreWidget() {
    const score = 72;
    const circumference = 2 * Math.PI * 70; // radius = 70
    const offset = circumference - (score / 100) * circumference;

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
                        <span className="text-4xl font-bold text-white">{score}%</span>
                    </div>
                </div>

                <p className="mt-4 text-center text-sm text-gray-400">
                    You are top <span className="text-cyan-400 font-semibold">15%</span> of your batch
                </p>

                {/* Market Trend Indicator */}
                <p className="mt-2 text-center text-xs text-red-400 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Market shifted -2% this week
                </p>
            </div>
        </div>
    );
}
