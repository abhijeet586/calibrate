import { getPendingVerifications, getPendingRoadmapTasks } from "@/lib/actions/mentor";
import VerificationQueueClient from "./VerificationQueueClient";
import { Activity, AlertTriangle, Inbox, TrendingUp } from "lucide-react";

export type QueueItem = {
    id: string; // The ID of either the verification row or student_progress row
    type: 'skill' | 'roadmap';
    student: {
        id: string;
        name: string;
    };
    taskName: string; // The skill name or the roadmap task instruction
    proofUrl: string;
    submittedAt: string;
};

export default async function MentorPage() {
    // 1. Fetch pending tasks from student_progress pipeline
    const verifications = await getPendingVerifications();

    // 2. Map into a unified array, tagging as 'roadmap' so the client calls resolveRoadmapTask
    const unifiedQueue: QueueItem[] = verifications.map((v: any) => ({
        id: v.id,
        type: 'roadmap' as const,
        student: {
            id: v.student_id,
            name: v.users?.full_name || "Unknown Student",
        },
        taskName: v.roadmap_items?.task_instruction || "Unknown Task",
        proofUrl: v.proof_link,
        submittedAt: v.created_at || new Date().toISOString(),
    }));

    // Optional: Sort by submittedAt descending (newest first)
    unifiedQueue.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    // KPI Summary (In a real app, you might fetch these dynamically too)
    const kpis = [
        {
            label: 'Pending Queue',
            value: unifiedQueue.length.toString(),
            icon: Inbox,
            color: 'cyan',
            trend: null,
        },
        {
            label: 'Batch Market Score',
            value: '68%',
            icon: Activity,
            color: 'green',
            trend: 'up',
        },
        {
            label: 'At-Risk Students',
            value: '5',
            icon: AlertTriangle,
            color: 'red',
            trend: null,
        },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top KPI Cards */}
            <div className="p-6 pb-3">
                <div className="grid grid-cols-3 gap-4">
                    {kpis.map((kpi) => {
                        const Icon = kpi.icon;
                        const colorMap: Record<string, { text: string; bg: string }> = {
                            cyan: { text: 'text-[#22d3ee]', bg: 'bg-[#22d3ee]/10' },
                            green: { text: 'text-green-500', bg: 'bg-green-500/10' },
                            red: { text: 'text-[#f87171]', bg: 'bg-[#f87171]/10' },
                        };
                        const colors = colorMap[kpi.color] || colorMap.cyan;
                        return (
                            <div
                                key={kpi.label}
                                className="bg-[#18181b] border border-[#27272a] rounded-lg p-5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                                            {kpi.label}
                                        </p>
                                        <div className="flex items-end gap-2">
                                            <p className={`text-3xl font-semibold ${colors.text}`}>
                                                {kpi.value}
                                            </p>
                                            {kpi.trend === 'up' && (
                                                <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
                                            )}
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-md ${colors.bg}`}>
                                        <Icon className={`w-5 h-5 ${colors.text}`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Work Zone */}
            <div className="flex-1 flex gap-6 px-6 pb-6 overflow-hidden">
                {/* 2. Pass to Client Component to handle Interactivity */}
                <VerificationQueueClient initialQueue={unifiedQueue} />

                {/* Right Side Panel - Activity Feed Placeholder */}
                <div className="w-80 overflow-hidden shrink-0">
                    <div className="h-full bg-[#18181b] border border-[#27272a] rounded-lg flex flex-col">
                        <div className="border-b border-[#27272a] px-5 py-4">
                            <h3 className="text-sm font-semibold text-white">Batch Activity</h3>
                            <p className="text-xs text-slate-400 mt-1">Recent student activity</p>
                        </div>
                        <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center text-center">
                            <Activity className="w-8 h-8 text-zinc-600 mb-3" />
                            <p className="text-sm text-zinc-400 font-medium tracking-tight">Activity Feed</p>
                            <p className="text-xs text-zinc-600 mt-1 px-4">Live updates will be integrated in the next milestone.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
