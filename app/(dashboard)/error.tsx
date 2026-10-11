"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Dashboard error caught by boundary:", error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#121212] border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-cyan-500" />
                
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-7 h-7" />
                </div>

                <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                    We encountered an issue loading this section. You can retry or head back to your market feed.
                </p>

                {error?.digest && (
                    <div className="text-[11px] font-mono text-zinc-600 bg-black/50 py-1.5 px-3 rounded-lg border border-zinc-800 mb-6 break-all">
                        Error Digest: {error.digest}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link
                        href="/student/feed"
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-sm border border-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Return to Feed
                    </Link>
                </div>
            </div>
        </div>
    );
}
