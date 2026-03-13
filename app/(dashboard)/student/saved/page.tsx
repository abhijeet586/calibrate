import { getAllRolesForStudent, getStudentCurrentRole } from "@/lib/actions/student";
import SavedTracksClient from "./SavedTracksClient";
import { Compass } from "lucide-react";

export default async function SavedTracksPage() {
    const [roles, currentRoleId] = await Promise.all([
        getAllRolesForStudent(),
        getStudentCurrentRole(),
    ]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 text-cyan-500 mb-1">
                    <Compass className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Career Navigation</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Career Tracks</h1>
                <p className="text-zinc-400">Select and manage your target career path to align your learning roadmap.</p>
            </div>

            <SavedTracksClient roles={roles} currentRoleId={currentRoleId} />
        </div>
    );
}
