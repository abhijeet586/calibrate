"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface PendingVerification {
    id: string;
    student_id: string;
    skill_id: string;
    proof_link: string;
    status: string;
    submitted_at: string;
    users?: {
        full_name: string;
    } | null;
    market_skills?: {
        name: string;
    } | null;
}

export interface PendingRoadmapTask {
    id: string;
    student_id: string;
    roadmap_item_id: string;
    proof_link: string;
    status: string;
    users?: {
        full_name: string;
    } | null;
    roadmap_items?: {
        task_instruction: string;
    } | null;
}

export async function getPendingVerifications() {
    const supabase = await createClient();

    // Fetch from student_progress because that's where the roadmap saves it!
    const { data, error } = await supabase
        .from("student_progress")
        .select(`
            id,
            status,
            proof_link,
            student_id,
            roadmap_items ( task_instruction )
        `)
        .eq("status", "pending");

    if (error) {
        console.error("Mentor Fetch Error:", error.message);
        return [];
    }

    if (!data || data.length === 0) return [];

    const studentIds = [...new Set(data.map((r: any) => r.student_id).filter(Boolean))];
    let profileMap: Record<string, string> = {};
    if (studentIds.length > 0) {
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", studentIds);
        if (profiles) {
            profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.full_name || ""]));
        }
    }

    return data.map((item: any) => ({
        ...item,
        users: { full_name: profileMap[item.student_id] || "Student" }
    }));
}

export async function getPendingRoadmapTasks() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("student_progress")
        .select(`
            id,
            student_id,
            roadmap_item_id,
            proof_link,
            status,
            roadmap_items!inner(
                task_instruction
            )
        `)
        .eq("status", "pending");

    if (error) {
        console.error("Error fetching pending roadmap tasks:", error);
        return [];
    }

    if (!data || data.length === 0) return [];

    const studentIds = [...new Set(data.map((r: any) => r.student_id).filter(Boolean))];
    let profileMap: Record<string, string> = {};
    if (studentIds.length > 0) {
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", studentIds);
        if (profiles) {
            profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.full_name || ""]));
        }
    }

    return data.map((item: any) => ({
        ...item,
        users: { full_name: profileMap[item.student_id] || "Student" }
    })) as unknown as PendingRoadmapTask[];
}

export async function resolveVerification(verificationId: string, status: 'approved' | 'rejected', comment: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // 1. Update the verifications table
    const { data: verificationData, error: updateError } = await supabase
        .from("verifications")
        .update({
            status,
            mentor_comment: comment,
            mentor_id: user.id,
            reviewed_at: new Date().toISOString()
        })
        .eq("id", verificationId)
        .select("student_id, skill_id")
        .single();

    if (updateError || !verificationData) {
        console.error("Error updating verification:", updateError);
        throw new Error(updateError?.message || "Verification not found");
    }

    // 2. If approved, insert/update the student_skills table
    if (status === 'approved') {
        const { student_id, skill_id } = verificationData;

        // Check if the student already has this skill
        const { data: existingSkill } = await supabase
            .from("student_skills")
            .select("id")
            .eq("student_id", student_id)
            .eq("skill_id", skill_id)
            .single();

        if (existingSkill) {
            // Update existing skill
            const { error: skillUpdateError } = await supabase
                .from("student_skills")
                .update({
                    verified_at: new Date().toISOString()
                })
                .eq("id", existingSkill.id);

            if (skillUpdateError) {
                console.error("Error updating student skill:", skillUpdateError);
                throw new Error(skillUpdateError.message);
            }
        } else {
            // Insert new skill
            const { error: skillInsertError } = await supabase
                .from("student_skills")
                .insert({
                    student_id,
                    skill_id,
                    proficiency: 100, // Default proficiency for a verified skill
                    verified_at: new Date().toISOString()
                });

            if (skillInsertError) {
                console.error("Error inserting student skill:", skillInsertError);
                throw new Error(skillInsertError.message);
            }
        }
    }

    revalidatePath("/admin/verifications");
    revalidatePath("/admin/verifications");
    revalidatePath("/mentor/verifications");
}

export async function resolveRoadmapTask(progressId: string, newStatus: 'verified' | 'rejected', comment: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // Update student_progress status and mentor feedback.
    // The DB trigger `grant_skill_on_verification` handles inserting into student_skills automatically.
    const { error: updateError } = await supabase
        .from("student_progress")
        .update({
            status: newStatus,
            mentor_feedback: comment,
        })
        .eq("id", progressId);

    if (updateError) {
        console.error("Error updating roadmap task:", updateError);
        throw new Error(updateError.message);
    }

    revalidatePath("/student/roadmap");
    revalidatePath("/mentor");
}

// =============================================================================
// Verify Skills Page — Data Types & Actions
// =============================================================================

export interface VerifySubmission {
    id: string;
    studentId: string;
    studentName: string;
    studentInitials: string;
    taskTitle: string;
    track: string;
    skill: string;
    skillId: string;
    proofUrl: string;
    instructions: string;
    submittedTime: string;
}

/**
 * Fetches all pending student_progress rows with rich joins for the Verify Skills page.
 */
export async function getVerifySkillsQueue(): Promise<VerifySubmission[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("student_progress")
        .select(`
            id,
            student_id,
            proof_link,
            created_at,
            skill_id,
            roadmap_items!inner (
                task_instruction,
                skill_id,
                target_role_id,
                target_roles ( name ),
                market_skills:skill_id ( name )
            )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getVerifySkillsQueue Error:", error.message);
        return [];
    }

    if (!data || data.length === 0) return [];

    const studentIds = [...new Set(data.map((r: any) => r.student_id).filter(Boolean))];
    let profileMap: Record<string, string> = {};
    if (studentIds.length > 0) {
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", studentIds);
        if (profiles) {
            profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.full_name || ""]));
        }
    }

    return (data || []).map((row: any) => {
        const fullName: string = profileMap[row.student_id] || "Student";
        const initials = fullName
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

        const ri = Array.isArray(row.roadmap_items) ? row.roadmap_items[0] : row.roadmap_items;
        const taskInstruction: string = ri?.task_instruction || "Unknown Task";
        const trackName: string = ri?.target_roles?.name || "General";
        const skillName: string = ri?.market_skills?.name || "General Skill";
        const skillId: string = ri?.skill_id || row.skill_id || "";

        // Relative time
        const diffMs = Date.now() - new Date(row.created_at || Date.now()).getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const submittedTime =
            diffHours < 1 ? "Just now" :
                diffHours < 24 ? `${diffHours} hour${diffHours > 1 ? "s" : ""} ago` :
                    `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? "s" : ""} ago`;

        return {
            id: row.id,
            studentId: row.student_id,
            studentName: fullName,
            studentInitials: initials,
            taskTitle: taskInstruction.length > 60 ? taskInstruction.slice(0, 60) + "…" : taskInstruction,
            track: trackName,
            skill: skillName,
            skillId,
            proofUrl: row.proof_link || "",
            instructions: taskInstruction,
            submittedTime,
        };
    });
}

/**
 * Approves a submission: marks student_progress as 'verified' and upserts student_skills.
 */
export async function approveSubmission(progressId: string, studentId: string, skillId: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // 1. Update student_progress status to 'verified'
    const { error: updateError } = await supabase
        .from("student_progress")
        .update({
            status: "verified",
            mentor_feedback: "Approved by mentor.",
        })
        .eq("id", progressId);

    if (updateError) {
        console.error("approveSubmission update error:", updateError);
        throw new Error(updateError.message);
    }

    // 2. Upsert student_skills (safety net alongside the DB trigger)
    if (skillId) {
        const { data: existingSkill } = await supabase
            .from("student_skills")
            .select("id")
            .eq("student_id", studentId)
            .eq("skill_id", skillId)
            .maybeSingle();

        if (existingSkill) {
            await supabase
                .from("student_skills")
                .update({ proficiency: 100, verified_at: new Date().toISOString() })
                .eq("id", existingSkill.id);
        } else {
            await supabase
                .from("student_skills")
                .insert({
                    student_id: studentId,
                    skill_id: skillId,
                    proficiency: 100,
                    verified_at: new Date().toISOString(),
                });
        }
    }

    revalidatePath("/mentor/verify");
    revalidatePath("/dashboard");
    revalidatePath("/student/roadmap");
}

/**
 * Rejects a submission: marks student_progress as 'rejected' with optional feedback.
 */
export async function rejectSubmission(progressId: string, feedback?: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    const { error: updateError } = await supabase
        .from("student_progress")
        .update({
            status: "rejected",
            mentor_feedback: feedback || "Rejected by mentor.",
        })
        .eq("id", progressId);

    if (updateError) {
        console.error("rejectSubmission update error:", updateError);
        throw new Error(updateError.message);
    }

    revalidatePath("/mentor/verify");
}
