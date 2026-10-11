import { getSkillGapAnalysis, TargetRole, StudentSkill } from "@/lib/actions/skills";
import { getUserId } from "@/lib/actions/userId";
import SkillGapAnalysisClient, { PrioritySkill } from "./SkillGapClient";

export default async function SkillGapAnalysisPage() {
    // 1. Get the current user
    const userId = await getUserId();

    if (!userId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-zinc-400">Please sign in to view your skill gap analysis.</p>
            </div>
        );
    }

    // 2. Fetch the complex skill gap object for the student
    const analysis = await getSkillGapAnalysis(userId);

    // Default empty states
    let radarData: any[] = [];
    let prioritySkills: PrioritySkill[] = [];
    let overallScore = 0;
    let verifiedCount = 0;
    let totalRequiredCount = 0;
    let criticalGapsCount = 0;

    const hasRole = !!analysis.role;

    if (hasRole) {
        const requiredSkills = analysis.role!.required_skills || {};
        const verifiedSkills = analysis.verifiedSkills || [];

        // Strip everything except a-z and 0-9 for maximum fuzzy matching
        const normalize = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

        // Normalized lookup with aggressive normalization
        const verifiedLookup = new Map<string, number>();
        verifiedSkills.forEach(skill => {
            const skillNameRaw = skill.market_skills?.name || skill.skill_id;
            const skillName = normalize(skillNameRaw);
            const current = verifiedLookup.get(skillName) || 0;
            if (skill.proficiency > current) {
                verifiedLookup.set(skillName, skill.proficiency);
            }
        });

        // Fuzzy match: normalized exact → then bidirectional substring containment
        const fuzzyLookup = (requiredKey: string): number => {
            const key = normalize(requiredKey);
            if (verifiedLookup.has(key)) return verifiedLookup.get(key)!;
            for (const [verifiedName, proficiency] of verifiedLookup) {
                if (verifiedName.includes(key) || key.includes(verifiedName)) {
                    return proficiency;
                }
            }
            return 0;
        };

        // Loop over the required_skills JSON object
        // schema: { "React": 100, "System Design": 85 } etc...
        const reqEntries = Object.entries(requiredSkills);
        totalRequiredCount = reqEntries.length;

        let totalProgressPct = 0;

        reqEntries.forEach(([skillName, requiredLevel]: [string, any]) => {
            const reqVal = Number(requiredLevel) || 100;
            const studentVal = fuzzyLookup(skillName);

            // 1. Radar Data (for charting)
            // Cap student value at the required amount to prevent radar spikes over 100%
            const displayStudentVal = Math.min(studentVal, reqVal);
            radarData.push({
                subject: skillName,
                required: reqVal,
                student: displayStudentVal
            });

            // Calculate percentage of this specific skill completed
            const skillProgressPct = reqVal > 0 ? (displayStudentVal / reqVal) * 100 : 100;
            totalProgressPct += skillProgressPct;

            if (studentVal >= reqVal) {
                verifiedCount += 1;
            } else {
                // If there's a gap, calculate it
                const gap = reqVal - studentVal;

                // Determine Priority. 
                // Let's say if gap > 40 or required level is very high (>=90), it's "High" priority.
                const priority = (gap >= 40 || reqVal >= 90) ? "High" : "Medium";

                if (priority === "High") {
                    criticalGapsCount += 1;
                }

                prioritySkills.push({
                    name: skillName,
                    priority,
                    progress: studentVal, // Raw proficiency 0-100
                    gap
                });
            }
        });

        // 2. Priority Skills (Sorted by gap descending)
        prioritySkills.sort((a, b) => b.gap - a.gap);

        // 3. Overall Readiness Score (Average of all specific skill percentages)
        if (totalRequiredCount > 0) {
            overallScore = Math.round(totalProgressPct / totalRequiredCount);
        }

        // Quick fallback for radar chart visualization if there are fewer than 3 skills
        if (radarData.length > 0 && radarData.length < 3) {
            // Radar charts need at least 3 points to look like a shape. Pad empty ones
            while (radarData.length < 3) {
                radarData.push({ subject: "-", required: 0, student: 0 });
            }
        }
    }

    return (
        <SkillGapAnalysisClient
            radarData={radarData}
            prioritySkills={prioritySkills}
            overallScore={overallScore}
            verifiedCount={verifiedCount}
            totalRequiredCount={totalRequiredCount}
            criticalGapsCount={criticalGapsCount}
            hasRole={hasRole}
        />
    );
}
