import { getAdminTargetRoles } from "@/lib/actions/admin";
import AdminTracksClient from "./AdminTracksClient";
import { Compass } from "lucide-react";

export default async function AdminTracksPage() {
    const roles = await getAdminTargetRoles();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-cyan-500 mb-2">
                    <Compass className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Track Administration</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                    Career <span className="text-cyan-400">Tracks</span>
                </h1>
                <p className="text-zinc-500 text-sm max-w-2xl">
                    Create and manage career tracks that students can select. Each track defines required skills and their proficiency levels.
                </p>
            </div>

            <AdminTracksClient initialRoles={roles} />
        </div>
    );
}
