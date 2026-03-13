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
            users!student_id ( full_name ),
            roadmap_items ( task_instruction )
        `)
        .eq("status", "pending");

    if (error) {
        console.error("Mentor Fetch Error:", error.message);
        return [];
    }

    return data || [];
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
            users:student_id (
                full_name
            ),
            roadmap_items!inner(
                task_instruction
            )
        `)
        .eq("status", "pending");

    if (error) {
        console.error("Error fetching pending roadmap tasks:", error);
        throw new Error(error.message);
    }

    return (data || []) as unknown as PendingRoadmapTask[];
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
