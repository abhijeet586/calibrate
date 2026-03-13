"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TargetRole, selectTargetRole } from "@/lib/actions/roles";
import { useRouter } from "next/navigation";
import { Check, Loader2, TrendingUp, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleCardsClientProps {
    roles: TargetRole[];
    currentRoleId: string | null;
}

export default function RoleCardsClient({ roles, currentRoleId }: RoleCardsClientProps) {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string | null>(currentRoleId);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSelect = async (roleId: string) => {
        setIsSubmitting(roleId);
        setError(null);
        try {
            await selectTargetRole(roleId);
            setSelectedId(roleId);
            // Re-fetch or refresh to ensure parent state is current if needed, 
            // but the redirect will handle the main navigation.
            router.push("/student/progress");
        } catch (err: any) {
            setError(err.message || "Failed to select career track");
            console.error(err);
        } finally {
            setIsSubmitting(null);
        }
    };

    return (
        <div className="space-y-8">
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                    <span className="text-sm">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role, index) => {
                    const isActive = selectedId === role.id;
                    const isPending = isSubmitting === role.id;

                    return (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer",
                                isActive
                                    ? "bg-zinc-900 border-cyan-500/50 shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]"
                                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                            )}
                            onClick={() => !isPending && handleSelect(role.id)}
                        >
                            {/* Decorative background glow for active role */}
                            {isActive && (
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-3xl" />
                            )}

                            <div className="p-6 flex flex-col h-full space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className={cn(
                                        "p-3 rounded-xl transition-colors",
                                        isActive ? "bg-cyan-500/10 text-cyan-400" : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-300"
                                    )}>
                                        <Target className="w-6 h-6" />
                                    </div>

                                    {role.market_demand_score >= 90 && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                            <Sparkles className="w-3 h-3" />
                                            High Demand
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                                        {role.name}
                                    </h3>
                                    <div className="mt-4 flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Market Score</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-bold text-zinc-300">{role.market_demand_score}%</span>
                                                <TrendingUp className="w-4 h-4 text-green-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 mt-auto">
                                    <button
                                        className={cn(
                                            "w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2",
                                            isActive
                                                ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
                                                : "bg-white/5 text-zinc-400 group-hover:bg-white/10 group-hover:text-white border border-transparent group-hover:border-zinc-700"
                                        )}
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Setting Up...
                                            </>
                                        ) : isActive ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Active Track
                                            </>
                                        ) : (
                                            "Select This Track"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
