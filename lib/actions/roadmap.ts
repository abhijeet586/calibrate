"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface RoadmapItem {
    id: string;
    roadmap_id: string;
    related_market_update_id: string | null;
    task_instruction: string;
    resource_link: string | null;
    is_verified_task: boolean;
    skill_id: string | null;
    roadmaps?: {
        id: string;
        title: string;
        mentor_id: string;
    } | null;
    student_progress?: {
        id: string;
        status: 'pending' | 'completed' | 'verified' | 'rejected';
        proof_link: string | null;
        mentor_feedback: string | null;
    }[];
}

export async function getStudentRoadmap(studentId: string, currentRoleId?: string | null) {
    const supabase = await createClient();

    let query = supabase
        .from("roadmap_items")
        .select(`
      id,
      roadmap_id,
      target_role_id,
      related_market_update_id,
      task_instruction,
      resource_link,
      is_verified_task,
      roadmaps (
        id,
        title,
        mentor_id
      ),
      skill_id,
      student_progress (
        id,
        status,
        proof_link,
        mentor_feedback
      )
    `)
        .eq("student_progress.student_id", studentId);

    if (currentRoleId) {
        query = query.eq("target_role_id", currentRoleId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching student roadmap:", error);
        throw new Error(error.message);
    }

    // Supabase joins return arrays for relations. We map it to match our interface.
    const mappedData = (data || []).map((item: any) => ({
        ...item,
        roadmaps: Array.isArray(item.roadmaps) ? item.roadmaps[0] : item.roadmaps
    }));

    return mappedData as RoadmapItem[];
}

export async function submitRoadmapProof(roadmapItemId: string, proofUrl: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // 1. Extract skill_id from the roadmap item
    const { data: roadmapItem, error: rmError } = await supabase
        .from("roadmap_items")
        .select("skill_id")
        .eq("id", roadmapItemId)
        .single();

    if (rmError) {
        console.error("Failed to fetch roadmap item skill_id:", rmError);
        throw new Error("Invalid roadmap item");
    }

    const skill_id = roadmapItem.skill_id;

    // 2. Check for existing progress
    const { data: existingProgress } = await supabase
        .from("student_progress")
        .select("id")
        .eq("student_id", user.id)
        .eq("roadmap_item_id", roadmapItemId)
        .single();

    if (existingProgress) {
        // Update existing row to pending with the proof link
        console.log("🚀 ATTEMPTING UPDATE for existing progress:", { progress_id: existingProgress.id, status: "pending", proof_link: proofUrl, skill_id });
        const { error } = await supabase
            .from("student_progress")
            .update({ status: "pending", proof_link: proofUrl, skill_id })
            .eq("id", existingProgress.id);
        if (error) {
            console.error("❌ SUPABASE UPDATE ERROR (student_progress):", error); // LOOK AT YOUR VS CODE TERMINAL FOR THIS
            throw new Error(error.message);
        } else {
            console.log("✅ UPDATE SUCCESSFUL");
        }
    } else {
        // Insert new row as pending
        console.log("🚀 ATTEMPTING INSERT:", { student_id: user.id, roadmap_item_id: roadmapItemId, skill_id: skill_id });
        const { error } = await supabase
            .from("student_progress")
            .insert({
                student_id: user.id,
                roadmap_item_id: roadmapItemId,
                skill_id: skill_id,
                status: "pending",
                proof_link: proofUrl,
            });
        if (error) {
            console.error("❌ SUPABASE INSERT ERROR (student_progress):", error); // LOOK AT YOUR VS CODE TERMINAL FOR THIS
            throw new Error(error.message);
        } else {
            console.log("✅ INSERT SUCCESSFUL");
        }
    }

    revalidatePath("/student/roadmap");
    revalidatePath("/dashboard");
    revalidatePath("/mentor");
}
