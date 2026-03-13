import { getAllTargetRoles, getStudentTargetRole } from "@/lib/actions/roles";
import { getUserId } from "@/lib/actions/userId";
import RoleCardsClient from "./RoleCardsClient";
import { Compass } from "lucide-react";

export default async function TargetRolesPage() {
    // 1. Get the current user
    const userId = await getUserId();

    // 2. Fetch available target roles and the student's current selection
    const [roles, currentRoleId] = await Promise.all([
        getAllTargetRoles(),
        getStudentTargetRole(userId)
    ]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-cyan-500 mb-2">
                        <Compass className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em]">Career Navigation</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">
                        Target Career <span className="text-cyan-400">Tracks</span>
                    </h1>
                    <p className="text-zinc-500 text-lg max-w-2xl font-medium">
                        Select a target role to dynamically generate your roadmap and perform a real-time market readiness analysis.
                    </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Available Paths</span>
                        <span className="text-2xl font-bold text-white">{roles.length}</span>
                    </div>
                    <div className="w-px h-10 bg-zinc-800" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Status</span>
                        <span className="text-xs font-bold text-cyan-400">
                            {currentRoleId ? "Track Assigned" : "Awaiting Selection"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Selection Area */}
            <RoleCardsClient roles={roles} currentRoleId={currentRoleId} />

            {/* Informational Footer */}
            <div className="pt-10 border-t border-zinc-800/50">
                <div className="bg-zinc-900/30 rounded-2xl p-8 border border-zinc-800/50 flex flex-col md:flex-row items-center gap-8 group hover:bg-zinc-900/50 transition-colors duration-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-700 group-hover:border-cyan-500/50 transition-colors shadow-xl">
                        <Target className="w-8 h-8 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-bold text-white mb-2">How Selection Impacts Your Dashboard</h4>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
                            Each track comes with its own set of <span className="text-zinc-200">Required Skills</span> and <span className="text-zinc-200">Mathematical Weightings</span>.
                            Changing your track will immediately update your Skill Gap Analysis, Progress Radar, and Roadmap recommendations to reflect real-world market requirements for that specific role.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Adding Target just in case it wasn't imported for footer
import { Target } from "lucide-react";
