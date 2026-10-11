import { getAdminTargetRoles, getAllSkills } from "@/lib/actions/admin";
import { Compass } from "lucide-react";
import AdminCurriculumClient from "./AdminCurriculumClient";

export const dynamic = "force-dynamic";

export default async function TrackOpsPage() {
    // Fetch base data needed for the form
    const [tracks, skills] = await Promise.all([
        getAdminTargetRoles(),
        getAllSkills()
    ]);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-cyan-500 mb-2">
                    <Compass className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Curriculum Builder</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                    Manage <span className="text-cyan-400">Roadmaps</span>
                </h1>
                <p className="text-zinc-500 text-sm max-w-2xl">
                    Build and organize the learning curriculum for each career track. Tasks added here will automatically populate the roadmap for students on that track.
                </p>
            </div>

            <AdminCurriculumClient tracks={tracks} skills={skills} />
        </div>
    );
}
