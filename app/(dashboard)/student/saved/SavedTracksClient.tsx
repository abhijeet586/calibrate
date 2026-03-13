"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignTargetRole, StudentTargetRole } from "@/lib/actions/student";
import { motion } from "framer-motion";
import {
    Target,
    TrendingUp,
    Loader2,
    CheckCircle2,
    Sparkles,
    ArrowRight,
} from "lucide-react";

interface Props {
    roles: StudentTargetRole[];
    currentRoleId: string | null;
}

export default function SavedTracksClient({ roles, currentRoleId }: Props) {
    const router = useRouter();
    const [selectingId, setSelectingId] = useState<string | null>(null);

    const handleSelect = async (roleId: string) => {
        setSelectingId(roleId);
        try {
            await assignTargetRole(roleId);
            router.push("/student/feed");
        } catch (err) {
            console.error("Failed to assign track:", err);
            alert("Failed to select track. Please try again.");
            setSelectingId(null);
        }
    };

    const getDemandLabel = (score: number) => {
        if (score >= 80) return { text: "High Demand 🔥", variant: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
        if (score >= 50) return { text: "Stable Demand", variant: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
        return { text: "Emerging", variant: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    };

    // Find the active track for the hero banner
    const activeTrack = roles.find(r => r.id === currentRoleId);

    if (roles.length === 0) {
        return (
            <div className="py-20 text-center">
                <Target className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-lg">No career tracks available yet.</p>
                <p className="text-zinc-600 text-sm mt-2">Check back soon — your CDC Admin will create tracks shortly.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Hero Banner: Active Track */}
            {activeTrack && (
                <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 opacity-50 blur-xl" />

                    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 rounded-xl bg-zinc-950/80 p-6 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)]">
                        <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/50">
                                <Target className="h-8 w-8" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-500">Active Track</span>
                                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500 ring-1 ring-green-500/20">
                                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                        In Progress
                                    </span>
                                </div>
                                <h2 className="mt-1 text-2xl font-bold text-white">{activeTrack.name}</h2>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {Object.keys(activeTrack.required_skills || {}).slice(0, 4).map(skill => (
                                        <span key={skill} className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 rounded">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full md:w-auto flex-col sm:flex-row gap-4 border-t border-zinc-800 pt-4 md:border-0 md:pt-0">
                            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">Market Demand</p>
                                    <p className="font-semibold text-zinc-200">{activeTrack.market_demand_score}%</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">Skills Required</p>
                                    <p className="font-semibold text-zinc-200">{Object.keys(activeTrack.required_skills || {}).length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Track Grid */}
            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">
                        {activeTrack ? "Explore Other Tracks" : "Available Tracks"}
                    </h3>
                    <span className="text-xs font-medium text-zinc-500">{roles.length} track{roles.length !== 1 ? 's' : ''} available</span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role, index) => {
                        const isActive = currentRoleId === role.id;
                        const isSelecting = selectingId === role.id;
                        const demand = getDemandLabel(role.market_demand_score);
                        const skillEntries = Object.entries(role.required_skills || {});

                        return (
                            <motion.div
                                key={role.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08, duration: 0.5 }}
                                whileHover={{ y: -4 }}
                                className={`group relative flex flex-col justify-between rounded-xl border p-5 shadow-lg transition-all ${isActive
                                    ? "border-cyan-500/40 bg-zinc-900 shadow-cyan-500/5"
                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:shadow-xl hover:shadow-cyan-500/5"
                                    }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${isActive ? "bg-cyan-500/10 text-cyan-400" : "bg-zinc-800 text-zinc-100 group-hover:bg-zinc-700"
                                            }`}>
                                            <Target className="h-6 w-6" />
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold border ${demand.variant}`}>
                                            {demand.text}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                                            {role.name}
                                        </h4>

                                        {/* Market Demand Score Bar */}
                                        <div className="mt-3 flex items-center gap-3">
                                            <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${role.market_demand_score >= 80 ? "bg-emerald-500" :
                                                        role.market_demand_score >= 50 ? "bg-amber-500" : "bg-blue-500"
                                                        }`}
                                                    style={{ width: `${role.market_demand_score}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-zinc-400 w-8 text-right">{role.market_demand_score}</span>
                                        </div>

                                        {/* Skills Tags */}
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {skillEntries.slice(0, 4).map(([skill]) => (
                                                <span
                                                    key={skill}
                                                    className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 rounded"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {skillEntries.length > 4 && (
                                                <span className="px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                                                    +{skillEntries.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 border-t border-zinc-800 pt-5">
                                    {isActive ? (
                                        <div className="w-full py-2.5 flex items-center justify-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold shadow-[inset_0_0_12px_rgba(6,182,212,0.1)]">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Active Track
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleSelect(role.id)}
                                            disabled={!!selectingId}
                                            className="w-full py-2.5 flex items-center justify-center gap-2 rounded-full bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            {isSelecting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Setting Up...
                                                </>
                                            ) : (
                                                <>
                                                    Switch Track
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
