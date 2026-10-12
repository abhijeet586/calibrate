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
    if (!currentRoleId) {
        return [];
    }

    const supabase = await createClient();

    try {
        let query = supabase
            .from("roadmap_items")
            .select(`
                id,
                target_role_id,
                skill_id,
                instruction,
                resource_link,
                created_at,
                target_roles (
                    id,
                    name
                ),
                market_skills (
                    id,
                    name
                )
            `);

        if (currentRoleId) {
            query = query.eq("target_role_id", currentRoleId);
        }

        const { data: items, error: itemsError } = await query;

        if (itemsError) {
            console.error("Error fetching roadmap_items:", itemsError);
            return [];
        }

        if (!items || items.length === 0) {
            return [];
        }

        // Fetch student_progress for this student
        const itemIds = items.map((i: any) => i.id);
        const { data: progressList } = await supabase
            .from("student_progress")
            .select("id, roadmap_item_id, status, proof_link, mentor_feedback")
            .eq("student_id", studentId)
            .in("roadmap_item_id", itemIds);

        const progressMap = new Map<string, any[]>();
        (progressList || []).forEach((p: any) => {
            if (!progressMap.has(p.roadmap_item_id)) {
                progressMap.set(p.roadmap_item_id, []);
            }
            progressMap.get(p.roadmap_item_id)!.push(p);
        });

        // Map into RoadmapItem structure for RoadmapClient
        const mappedData: RoadmapItem[] = items.map((item: any) => {
            const trackTitle = item.target_roles?.name || "Curriculum Track";
            return {
                id: item.id,
                roadmap_id: item.target_role_id,
                related_market_update_id: null,
                task_instruction: item.instruction || "Curriculum Milestone",
                resource_link: item.resource_link,
                is_verified_task: false,
                skill_id: item.skill_id,
                roadmaps: {
                    id: item.target_role_id,
                    title: trackTitle,
                    mentor_id: "",
                },
                student_progress: progressMap.get(item.id) || [],
            };
        });

        return mappedData;
    } catch (err) {
        console.error("Unexpected error in getStudentRoadmap:", err);
        return [];
    }
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
        .maybeSingle();

    if (rmError || !roadmapItem) {
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
        .maybeSingle();

    if (existingProgress) {
        // Update existing row to pending with the proof link
        const { error } = await supabase
            .from("student_progress")
            .update({ status: "pending", proof_link: proofUrl })
            .eq("id", existingProgress.id);
        if (error) {
            console.error("❌ SUPABASE UPDATE ERROR (student_progress):", error);
            throw new Error(error.message);
        } else {
            console.log("✅ UPDATE SUCCESSFUL");
        }
    } else {
        // Insert new row as pending
        console.log("🚀 ATTEMPTING INSERT:", { student_id: user.id, roadmap_item_id: roadmapItemId });
        const { error } = await supabase
            .from("student_progress")
            .insert({
                student_id: user.id,
                roadmap_item_id: roadmapItemId,
                status: "pending",
                proof_link: proofUrl,
            });
        if (error) {
            console.error("❌ SUPABASE INSERT ERROR (student_progress):", error);
            throw new Error(error.message);
        } else {
            console.log("✅ INSERT SUCCESSFUL");
        }
    }

    revalidatePath("/student/roadmap");
    revalidatePath("/dashboard");
    revalidatePath("/mentor");
}
