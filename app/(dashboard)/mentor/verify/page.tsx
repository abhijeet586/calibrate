import { getVerifySkillsQueue } from "@/lib/actions/mentor";
import VerifySkillsClient from "./VerifySkillsClient";

export const dynamic = "force-dynamic";

export default async function VerifySkillsPage() {
    const submissions = await getVerifySkillsQueue();

    // Derive unique track and skill lists from real data
    const trackSet = new Set(submissions.map((s) => s.track));
    const skillSet = new Set(submissions.map((s) => s.skill));

    const tracks = ["All Tracks", ...Array.from(trackSet).sort()];
    const skills = ["All Skills", ...Array.from(skillSet).sort()];

    return (
        <VerifySkillsClient
            submissions={submissions}
            tracks={tracks}
            skills={skills}
        />
    );
}
