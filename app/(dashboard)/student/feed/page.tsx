import { ScoreWidget } from "@/components/student/ScoreWidget";
import { FocusWidget } from "@/components/student/FocusWidget";
import { HotSkillsWidget } from "@/components/student/HotSkillsWidget";
import { getMarketFeed } from "@/lib/actions/feed";
import { getSkillGapAnalysis, getHotSkills } from "@/lib/actions/skills";
import { getUserId } from "@/lib/actions/userId";
import FeedClient from "./FeedClient";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
    const userId = await getUserId();

    if (!userId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-zinc-400">Please sign in to view your feed.</p>
            </div>
        );
    }

    // Fetch live market data and user's skill analysis in parallel
    const [initialFeed, analysis, hotSkillsList] = await Promise.all([
        getMarketFeed(),
        getSkillGapAnalysis(userId),
        getHotSkills()
    ]);

    // 1. Calculate Score and Gaps
    let overallScore = 0;
    const focusItems: { id: string; text: string; completed: boolean }[] = [];

    if (analysis.role) {
        const requiredSkills = analysis.role.required_skills || {};
        const verifiedSkills = analysis.verifiedSkills || [];

        // Strip everything except a-z and 0-9 for maximum fuzzy matching
        const normalize = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

        // Build the verified skills lookup with normalized keys
        const verifiedLookup = new Map<string, number>();
        verifiedSkills.forEach(skill => {
            const skillNameRaw = skill.market_skills?.name || skill.skill_id;
            const skillName = normalize(skillNameRaw);
            const current = verifiedLookup.get(skillName) || 0;
            if (skill.proficiency > current) {
                verifiedLookup.set(skillName, skill.proficiency);
            }
        });

        // Debug: Print the full student skills map so we can see what's available
        console.log("═══ MARKET READINESS DEBUG ═══");
        console.log("Role:", analysis.role.name);
        console.log("Required Skills (raw):", JSON.stringify(requiredSkills));
        console.log("Student Verified Skills Map:", Object.fromEntries(verifiedLookup));
        console.log("Total verified skill entries from DB:", verifiedSkills.length);

        // Fuzzy match: normalized exact → then bidirectional substring containment
        const fuzzyLookup = (rawKey: string): { proficiency: number; matchedWith: string | null } => {
            const key = normalize(rawKey);

            // 1. Exact normalized match
            if (verifiedLookup.has(key)) {
                return { proficiency: verifiedLookup.get(key)!, matchedWith: `exact:${key}` };
            }

            // 2. Fuzzy substring: "postgresql".includes("postgres") or "postgres".includes("sql")
            for (const [verifiedName, proficiency] of verifiedLookup) {
                if (verifiedName.includes(key) || key.includes(verifiedName)) {
                    return { proficiency, matchedWith: `fuzzy:${verifiedName}` };
                }
            }

            return { proficiency: 0, matchedWith: null };
        };

        const reqEntries = Object.entries(requiredSkills);
        const totalRequiredCount = reqEntries.length;
        let totalProgressPct = 0;

        reqEntries.forEach(([skillNameRaw, requiredLevel]: [string, any]) => {
            const reqVal = Number(requiredLevel) || 100;
            const { proficiency: studentVal, matchedWith } = fuzzyLookup(skillNameRaw);

            console.log(
                `COMPARING: "${normalize(skillNameRaw)}" (req: ${reqVal}) → ` +
                `${matchedWith ? `✅ MATCH [${matchedWith}] prof=${studentVal}` : '❌ NO MATCH'}`
            );

            // Limit contribution up to the required amount
            const displayStudentVal = Math.min(studentVal, reqVal);
            const skillProgressPct = reqVal > 0 ? (displayStudentVal / reqVal) * 100 : 100;
            totalProgressPct += skillProgressPct;

            // Missing skills go to the Focus Widget
            if (studentVal < reqVal) {
                focusItems.push({
                    id: skillNameRaw,
                    text: `Master ${skillNameRaw}`,
                    completed: false
                });
            }
        });

        if (totalRequiredCount > 0) {
            overallScore = Math.round(totalProgressPct / totalRequiredCount);
        }

        console.log(`═══ FINAL SCORE: ${overallScore}% (${totalProgressPct.toFixed(1)} / ${totalRequiredCount} skills) ═══`);

        // Sort gaps so we show the ones with 0 proficiency first (biggest gaps)
        focusItems.sort((a, b) => {
            const aVal = fuzzyLookup(a.id).proficiency;
            const bVal = fuzzyLookup(b.id).proficiency;
            return aVal - bVal;
        });
    } else {
        console.warn("Calibrate Cloud Dashboard Error: No active Target Role found for student", userId);
        console.warn("analysis.role is:", analysis.role);
    }

    return (
        <div className="flex h-full gap-6">
            {/* Top-level Client Component handles filtering and rendering rows */}
            <FeedClient initialFeed={initialFeed} />

            {/* Right Widgets Column */}
            <div className="w-80 space-y-6 shrink-0">
                <ScoreWidget score={overallScore} />
                <FocusWidget items={focusItems.slice(0, 3)} /> {/* Show top 3 critical gaps */}
                <HotSkillsWidget hotSkills={hotSkillsList} />
            </div>
        </div>
    );
}
