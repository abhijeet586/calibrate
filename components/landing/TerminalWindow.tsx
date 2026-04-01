"use client";

import { useEffect } from "react";
import { useMotionValue, useTransform, animate, motion } from "framer-motion";

const TARGET_SCORE = 70;
const ANIMATION_DURATION = 1.5; // half-cycle (matches 50% keyframe of the 3s loop)

export function TerminalWindow() {
    const motionVal = useMotionValue(0);
    const rounded = useTransform(motionVal, (v) => `${Math.round(v)}%`);

    useEffect(() => {
        // Mirror the CSS keyframes: 0→70 over 1.5s, 70→0 over 1.5s, repeat
        const controls = animate(motionVal, [0, TARGET_SCORE, 0], {
            duration: ANIMATION_DURATION * 2, // full 3s cycle
            ease: "easeInOut",
            repeat: Infinity,
        });
        return () => controls.stop();
    }, [motionVal]);

    return (
        <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-black/80 shadow-2xl backdrop-blur-sm">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
                <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="ml-2 text-xs text-gray-400">skill-tracker.sh</span>
            </div>

            {/* Terminal Content */}
            <div className="p-6 font-mono text-sm">
                <div className="space-y-3">
                    <div className="text-gray-400">
                        <span className="text-cyan-400">$</span> marketready analyze --student
                    </div>
                    <div className="text-cyan-400">
                        → Analyzing skill portfolio...
                    </div>

                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-300">DSA Proficiency:</span>
                            <span className="text-green-400">Advanced</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">React Knowledge:</span>
                            <span className="text-cyan-400">Intermediate</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">System Design:</span>
                            <span className="text-yellow-400">Learning</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="mb-2 flex justify-between text-gray-300">
                            <span>Market Readiness Score:</span>
                            <motion.span className="text-cyan-400 text-xl font-bold">
                                {rounded}
                            </motion.span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 terminal-progress-bar" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                        <span className="text-green-400 text-xs">Active</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .terminal-progress-bar {
                    animation: progress-fill 3s ease-in-out infinite;
                }
                @keyframes progress-fill {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 0%; }
                }
            `}</style>
        </div>
    );
}

