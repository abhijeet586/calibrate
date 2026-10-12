"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface TargetRole {
    id: string;
    name: string;
    required_skills: Record<string, any>;
    market_demand_score: number;
}

export interface StudentSkill {
    id: string;
    skill_id: string;
    proficiency: number;
    verified_at: string | null;
    market_skills?: {
        name: string;
        category: string;
    } | null;
}

export interface SkillGapAnalysis {
    role: TargetRole | null;
    verifiedSkills: StudentSkill[];
}

export async function getSkillGapAnalysis(studentId: string): Promise<SkillGapAnalysis> {
    try {
        const supabase = await createClient();

        // 1. Fetch the student's active role from student_target_roles, then target_roles
        const { data: studentRoles, error: rolesError } = await supabase
            .from("student_target_roles")
            .select(`
          role_id,
          target_roles (
            id,
            name,
            required_skills,
            market_demand_score
          )
        `)
            .eq("student_id", studentId)
            .limit(1)
            .maybeSingle();

        if (rolesError && rolesError.code !== 'PGRST116') {
            console.error("Error fetching target roles:", rolesError);
        }

        // Defensive mapping for related data which can sometimes be returned as an array by PostgREST
        let role: TargetRole | null = null;
        if (studentRoles?.target_roles) {
            if (Array.isArray(studentRoles.target_roles)) {
                role = studentRoles.target_roles[0] as unknown as TargetRole;
            } else {
                role = studentRoles.target_roles as unknown as TargetRole;
            }
        }

        // Fallback to top target role if none is explicitly assigned
        if (!role) {
            const { data: defaultRole } = await supabase
                .from("target_roles")
                .select("id, name, required_skills, market_demand_score")
                .order("market_demand_score", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (defaultRole) {
                role = defaultRole as TargetRole;
            }
        }

        // 2. Fetch the student's verified skills
        const { data: verifiedSkills, error: skillsError } = await supabase
            .from("student_skills")
            .select(`
          id,
          skill_id,
          proficiency,
          verified_at,
          market_skills (
            name,
            category
          )
        `)
            .eq("student_id", studentId)
            .not("verified_at", "is", null);

        if (skillsError) {
            console.error("Error fetching student skills:", skillsError);
        }

        // 3. Fetch verified roadmap tasks to complement explicit skills
        const { data: verifiedProgress } = await supabase
            .from("student_progress")
            .select(`
                id,
                status,
                roadmap_items (
                    skill_id,
                    market_skills:skill_id (
                        name,
                        category
                    )
                )
            `)
            .eq("student_id", studentId)
            .eq("status", "verified");

        // Merge verified progress into our verifiedSkills array for the math engines
        const progressAsSkills = (verifiedProgress || [])
            .filter((p: any) => p.roadmap_items?.skill_id)
            .map((p: any) => ({
                id: p.id,
                skill_id: p.roadmap_items.skill_id,
                proficiency: 100,
                verified_at: new Date().toISOString(),
                market_skills: p.roadmap_items.market_skills
            }));

        return {
            role,
            verifiedSkills: [
                ...((verifiedSkills || []) as unknown as StudentSkill[]),
                ...progressAsSkills as unknown as StudentSkill[]
            ]
        };
    } catch (err) {
        console.error("Exception in getSkillGapAnalysis:", err);
        return {
            role: null,
            verifiedSkills: []
        };
    }
}

export async function submitSkillForVerification(skillId: string, proofUrl: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    const { error } = await supabase
        .from("verifications")
        .insert({
            student_id: user.id,
            skill_id: skillId,
            proof_link: proofUrl,
            status: "pending",
            submitted_at: new Date().toISOString(),
        });

    if (error) {
        console.error("Error submitting skill for verification:", error);
        throw new Error(error.message);
    }

    revalidatePath("/student/skills");
    revalidatePath("/dashboard");
}

export async function getHotSkills() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("market_skills")
        .select("name")
        .limit(10);

    if (error) {
        console.error("Error fetching skills:", error);
        return [];
    }

    return (data || []).map((s: any) => s.name as string);
}
