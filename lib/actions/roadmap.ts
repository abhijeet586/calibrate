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
            .select("id, roadmap_item_id, status, proof_link, mentor_feedback, created_at, updated_at")
            .eq("student_id", studentId)
            .in("roadmap_item_id", itemIds)
            .order("created_at", { ascending: false });

        const progressMap = new Map<string, any[]>();
        (progressList || []).forEach((p: any) => {
            if (!progressMap.has(p.roadmap_item_id)) {
                progressMap.set(p.roadmap_item_id, []);
            }
            progressMap.get(p.roadmap_item_id)!.push(p);
        });

        // Ensure each item's progress list has verified first, or latest updated/created first
        for (const list of progressMap.values()) {
            list.sort((a, b) => {
                if (a.status === 'verified') return -1;
                if (b.status === 'verified') return 1;
                const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
                const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
                return timeB - timeA;
            });
        }

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

    // 2. Fetch all existing progress records for this student and roadmap item
    const { data: existingRows, error: fetchErr } = await supabase
        .from("student_progress")
        .select("id, created_at")
        .eq("student_id", user.id)
        .eq("roadmap_item_id", roadmapItemId)
        .order("created_at", { ascending: false });

    if (fetchErr) {
        console.error("Error fetching existing progress:", fetchErr);
    }

    if (existingRows && existingRows.length > 0) {
        const primaryId = existingRows[0].id;
        // Update existing row to pending with the proof link, resetting feedback
        const { error } = await supabase
            .from("student_progress")
            .update({
                status: "pending",
                proof_link: proofUrl,
                mentor_feedback: null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", primaryId);

        if (error) {
            console.error("❌ SUPABASE UPDATE ERROR (student_progress):", error);
            throw new Error(error.message);
        } else {
            console.log("✅ UPDATE SUCCESSFUL");
        }

        // Clean up any historical duplicate rows if they exist
        if (existingRows.length > 1) {
            const duplicateIds = existingRows.slice(1).map(r => r.id);
            await supabase
                .from("student_progress")
                .delete()
                .in("id", duplicateIds);
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
    revalidatePath("/student/progress");
    revalidatePath("/mentor/verify");
    revalidatePath("/mentor");
    revalidatePath("/dashboard");
}
