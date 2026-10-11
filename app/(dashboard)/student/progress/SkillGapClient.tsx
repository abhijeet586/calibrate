"use client";

import {
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    ArrowRight,
    Flame,
    Layers,
    Inbox,
} from "lucide-react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { TargetRole, StudentSkill } from "@/lib/actions/skills";

// ─── Interfaces ───────────────────────────────────────────────

export interface PrioritySkill {
    name: string;
    priority: "High" | "Medium";
    progress: number; // 0-100
    gap: number; // how many % behind required
}

// ─── KPI Card Component ──────────────────────────────────────

function KPICard({
    title,
    value,
    subtitle,
    variant = "default",
    progress,
}: {
    title: string;
    value: string;
    subtitle: string;
    variant?: "progress" | "verified" | "critical" | "default";
    progress?: number;
}) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-zinc-700 group">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1 z-10">
                    <h3 className="text-zinc-400 font-medium text-xs uppercase tracking-wider">
                        {title}
                    </h3>
                    <div
                        className={`text-3xl font-bold tracking-tight ${variant === "critical" ? "text-red-500" : "text-white"
                            }`}
                    >
                        {variant === "verified" ? (
                            <span className="text-cyan-500">{value}</span>
                        ) : (
                            value
                        )}
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">{subtitle}</p>
                </div>

                {/* Right-side visual */}
                {variant === "progress" && progress !== undefined && (
                    <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                className="text-zinc-800"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 28}
                                strokeDashoffset={
                                    2 * Math.PI * 28 * (1 - progress / 100)
                                }
                                className="text-cyan-500 transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-cyan-500 font-bold text-xs">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>
                )}

                {variant === "verified" && (
                    <div className="p-3 rounded-full bg-cyan-500/10">
                        <CheckCircle2 className="w-6 h-6 text-cyan-500" />
                    </div>
                )}

                {variant === "critical" && (
                    <div className="p-3 rounded-full bg-red-500/10">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                )}
            </div>

            {/* Background glow */}
            <div
                className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-10 ${variant === "critical"
                    ? "bg-red-500"
                    : variant === "progress"
                        ? "bg-cyan-500"
                        : "bg-zinc-500"
                    }`}
            />
        </div>
    );
}

// ─── Skill Radar Chart ───────────────────────────────────────

function SkillRadarChart({ radarData }: { radarData: any[] }) {
    return (
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col">
            <h3 className="text-zinc-400 font-medium text-sm uppercase tracking-wider mb-4">
                Skill Assessment Radar
            </h3>
            <div className="flex-1 w-full min-h-[320px]">
                {radarData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                        <Radar className="w-12 h-12 mb-2 text-zinc-700" />
                        <p>No role data available.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        <RadarChart
                            cx="50%"
                            cy="50%"
                            outerRadius="75%"
                            data={radarData}
                        >
                            <PolarGrid stroke="#3f3f46" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 100]}
                                tick={false}
                                axisLine={false}
                            />

                            {/* Required Skills boundary — dashed */}
                            <Radar
                                name="Required Skills"
                                dataKey="required"
                                stroke="#71717a"
                                strokeDasharray="4 4"
                                fill="transparent"
                                fillOpacity={0}
                            />

                            {/* Student Skills — solid cyan fill */}
                            <Radar
                                name="Student Skills"
                                dataKey="student"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                fill="#06b6d4"
                                fillOpacity={0.2}
                            />

                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#18181b",
                                    borderColor: "#27272a",
                                    color: "#fff",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                }}
                                itemStyle={{ color: "#fff" }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-dashed border-zinc-500 rounded-full" />
                    <span className="text-xs text-zinc-400">Required Level</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-500/20 border border-cyan-500 rounded-full" />
                    <span className="text-xs text-zinc-400">Your Level</span>
                </div>
            </div>
        </div>
    );
}

// ─── Priority Skills List ────────────────────────────────────

function PrioritySkillsList({ prioritySkills }: { prioritySkills: PrioritySkill[] }) {
    return (
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-zinc-400 font-medium text-sm uppercase tracking-wider">
                        Priority Skills to Acquire
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                        Based on market demand & track requirements
                    </p>
                </div>
                <button className="flex items-center gap-1 text-cyan-500 text-sm hover:text-cyan-400 transition-colors">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Skill Items */}
            <div className="mt-4 space-y-4">
                {prioritySkills.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                        <CheckCircle2 className="w-8 h-8 mb-2 text-zinc-700" />
                        <p className="text-sm">You have verified all priority skills!</p>
                    </div>
                ) : (
                    prioritySkills.map((skill) => (
                        <div
                            key={skill.name}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
                        >
                            {/* Icon */}
                            <div
                                className={`flex-shrink-0 p-2.5 rounded-lg ${skill.priority === "High"
                                    ? "bg-red-500/10"
                                    : "bg-orange-500/10"
                                    }`}
                            >
                                {skill.priority === "High" ? (
                                    <Flame
                                        className="w-5 h-5 text-red-500"
                                        strokeWidth={2}
                                    />
                                ) : (
                                    <Layers
                                        className="w-5 h-5 text-orange-500"
                                        strokeWidth={2}
                                    />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-sm font-semibold text-white truncate max-w-[120px]" title={skill.name}>
                                        {skill.name}
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${skill.priority === "High"
                                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                            : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                            }`}
                                    >
                                        {skill.priority} Priority
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${skill.priority === "High"
                                            ? "bg-red-500"
                                            : "bg-orange-500"
                                            }`}
                                        style={{ width: `${Math.max(5, skill.progress)}%` }} // Minimum width for visibility
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ─── Main Client Component Wrapper ───────────────────────────

export default function SkillGapAnalysisClient({
    radarData,
    prioritySkills,
    overallScore,
    verifiedCount,
    totalRequiredCount,
    criticalGapsCount,
    hasRole
}: {
    radarData: any[];
    prioritySkills: PrioritySkill[];
    overallScore: number;
    verifiedCount: number;
    totalRequiredCount: number;
    criticalGapsCount: number;
    hasRole: boolean;
}) {

    if (!hasRole) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
                    <Target className="w-10 h-10 text-zinc-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No Target Role Selected</h2>
                <p className="text-zinc-400 text-center max-w-md">
                    To see your Skill Gap Analysis, you need to select a career track first.
                    This will allow us to compare your verified skills against market requirements.
                </p>
                <div className="mt-8">
                    <button className="px-6 py-3 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 font-semibold transition-colors">
                        Select a Target Role
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                    Analysis Overview
                </h2>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg hover:text-white hover:border-zinc-700 text-sm font-medium transition-colors">
                        Download PDF
                    </button>
                    <button className="px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 text-sm font-medium transition-colors">
                        Request Mentor Review
                    </button>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Readiness Score"
                    value={`${Math.round(overallScore)}`}
                    subtitle={overallScore >= 80 ? "You are highly ready!" : overallScore >= 50 ? "You are on track." : "Needs more work."}
                    variant="progress"
                    progress={overallScore}
                />
                <KPICard
                    title="Verified Skills"
                    value={`${verifiedCount}/${totalRequiredCount}`}
                    subtitle={`${totalRequiredCount > 0 ? Math.round((verifiedCount / totalRequiredCount) * 100) : 0}% Completion Rate`}
                    variant="verified"
                />
                <KPICard
                    title="Critical Gaps"
                    value={`${criticalGapsCount}`}
                    subtitle="High-weight skills missing"
                    variant="critical"
                />
            </div>

            {/* Bottom Row: Radar Chart + Priority Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkillRadarChart radarData={radarData} />
                <PrioritySkillsList prioritySkills={prioritySkills} />
            </div>
        </div>
    );
}

// Adding Target just in case it wasn't imported for empty state
import { Target } from "lucide-react";
