"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignTargetRole, StudentTargetRole } from "@/lib/actions/student";
import { Target, TrendingUp, Loader2, CheckCircle2, Sparkles } from "lucide-react";

interface Props {
    roles: StudentTargetRole[];
    currentRoleId: string | null;
}

export default function StudentRolesClient({ roles, currentRoleId }: Props) {
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
        if (score >= 80) return { text: "High Demand", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
        if (score >= 50) return { text: "Moderate", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
        return { text: "Emerging", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    };

    if (roles.length === 0) {
        return (
            <div className="py-20 text-center">
                <Target className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No career tracks available yet. Check back soon!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => {
                const isActive = currentRoleId === role.id;
                const isSelecting = selectingId === role.id;
                const demand = getDemandLabel(role.market_demand_score);
                const skillEntries = Object.entries(role.required_skills || {});

                return (
                    <div
                        key={role.id}
                        className={`
                            relative group bg-zinc-900 border rounded-2xl p-6 transition-all duration-300
                            ${isActive
                                ? "border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                                : "border-zinc-800 hover:border-zinc-700 hover:shadow-lg"
                            }
                        `}
                    >
                        {/* Active Indicator */}
                        {isActive && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-cyan-500 text-black rounded-full flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" />
                                    Active Track
                                </span>
                            </div>
                        )}

                        {/* Header */}
                        <div className="mb-5 mt-1">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-bold text-white">{role.name}</h3>
                                <span className={`px-2.5 py-1 text-[10px] font-semibold border rounded-full whitespace-nowrap ${demand.color}`}>
                                    {demand.text}
                                </span>
                            </div>

                            {/* Demand Score Bar */}
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-4 h-4 text-zinc-500" />
                                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${role.market_demand_score >= 80 ? "bg-emerald-500" :
                                                role.market_demand_score >= 50 ? "bg-amber-500" : "bg-blue-500"
                                            }`}
                                        style={{ width: `${role.market_demand_score}%` }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-zinc-400 w-8 text-right">
                                    {role.market_demand_score}
                                </span>
                            </div>
                        </div>

                        {/* Required Skills */}
                        <div className="mb-6">
                            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider mb-2.5">
                                Required Skills ({skillEntries.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {skillEntries.slice(0, 6).map(([skill, level]) => (
                                    <span
                                        key={skill}
                                        className="px-2.5 py-1 text-[11px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 rounded-md"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {skillEntries.length > 6 && (
                                    <span className="px-2.5 py-1 text-[11px] font-medium text-zinc-500">
                                        +{skillEntries.length - 6} more
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Button */}
                        {isActive ? (
                            <div className="flex items-center justify-center gap-2 py-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-sm font-semibold">
                                <CheckCircle2 className="w-4 h-4" />
                                Currently Selected
                            </div>
                        ) : (
                            <button
                                onClick={() => handleSelect(role.id)}
                                disabled={!!selectingId}
                                className="w-full py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-semibold text-white hover:bg-cyan-500 hover:text-black hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSelecting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Selecting...
                                    </>
                                ) : (
                                    <>
                                        <Target className="w-4 h-4" />
                                        Select This Track
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
