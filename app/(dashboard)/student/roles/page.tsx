import { getAllRolesForStudent, getStudentCurrentRole } from "@/lib/actions/student";
import StudentRolesClient from "./StudentRolesClient";
import { Compass } from "lucide-react";

export default async function StudentRolesPage() {
    const [roles, currentRoleId] = await Promise.all([
        getAllRolesForStudent(),
        getStudentCurrentRole(),
    ]);

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-cyan-500 mb-2">
                    <Compass className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Career Path</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                    Choose Your <span className="text-cyan-400">Track</span>
                </h1>
                <p className="text-zinc-500 text-sm max-w-2xl">
                    Select a career track to start your market readiness journey. Your skill gap analysis and roadmap will be customized to this path.
                </p>
            </div>

            <StudentRolesClient roles={roles} currentRoleId={currentRoleId} />
        </div>
    );
}
