"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getMentorWorkloads } from "./bottlenecks";

interface ReassignResult {
    success: boolean;
    message: string;
}

interface PendingTask {
    id: string;
}

/**
 * Reassigns all pending verification tasks for a given track to mentors
 * using a lowest-load-first algorithm.
 */
export async function reassignTrackTasks(trackId: string): Promise<ReassignResult> {
    try {
        const supabase = await createClient();

        // 1. Verify the current user is an admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, message: "Unauthorized" };
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || !["admin", "cdc_admin"].includes(profile.role)) {
            return { success: false, message: "Forbidden: Admin access required" };
        }

        // 2. Get all roadmap_item IDs belonging to this track
        const { data: roadmapItems, error: riError } = await supabase
            .from("roadmap_items")
            .select("id")
            .eq("target_role_id", trackId);

        if (riError) {
            return { success: false, message: `Failed to fetch roadmap items: ${riError.message}` };
        }

        if (!roadmapItems || roadmapItems.length === 0) {
            return { success: false, message: "No roadmap items found for this track" };
        }

        const roadmapItemIds = roadmapItems.map((ri) => ri.id);

        // 3. Fetch all pending student_progress rows for these roadmap items
        const { data: pendingTasks, error: spError } = await supabase
            .from("student_progress")
            .select("id")
            .in("roadmap_item_id", roadmapItemIds)
            .eq("status", "pending");

        if (spError) {
            return { success: false, message: `Failed to fetch pending tasks: ${spError.message}` };
        }

        if (!pendingTasks || pendingTasks.length === 0) {
            return { success: true, message: "No pending tasks to reassign" };
        }

        // 4. Get mentor workloads
        const mentors = await getMentorWorkloads();

        if (mentors.length === 0) {
            return { success: false, message: "No mentors available for assignment" };
        }

        // 5. Lowest-load-first assignment
        // Create a mutable copy of workload counts
        const workloadMap = new Map<string, number>(
            mentors.map((m) => [m.mentor_id, m.active_count])
        );

        const assignments: Array<{ taskId: string; mentorId: string }> = [];

        for (const task of pendingTasks as PendingTask[]) {
            // Find the mentor with the lowest current count
            let lowestMentorId = mentors[0].mentor_id;
            let lowestCount = workloadMap.get(lowestMentorId) ?? 0;

            for (const mentor of mentors) {
                const count = workloadMap.get(mentor.mentor_id) ?? 0;
                if (count < lowestCount) {
                    lowestCount = count;
                    lowestMentorId = mentor.mentor_id;
                }
            }

            assignments.push({ taskId: task.id, mentorId: lowestMentorId });
            // Increment the count for this mentor in our local tracker
            workloadMap.set(lowestMentorId, lowestCount + 1);
        }

        // 6. Batch update — group by mentor to reduce DB round-trips
        const mentorToTasks = new Map<string, string[]>();
        for (const { taskId, mentorId } of assignments) {
            const existing = mentorToTasks.get(mentorId) ?? [];
            existing.push(taskId);
            mentorToTasks.set(mentorId, existing);
        }

        for (const [mentorId, taskIds] of mentorToTasks) {
            const { error: updateError } = await supabase
                .from("student_progress")
                .update({ assigned_mentor_id: mentorId })
                .in("id", taskIds);

            if (updateError) {
                console.error(`Error assigning tasks to mentor ${mentorId}:`, updateError.message);
                return {
                    success: false,
                    message: `Failed to update assignments for a mentor: ${updateError.message}`,
                };
            }
        }

        // 7. Revalidate caches
        revalidatePath("/admin");
        revalidatePath("/mentor");

        return {
            success: true,
            message: `Successfully reassigned ${pendingTasks.length} tasks across ${mentors.length} mentors`,
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        console.error("reassignTrackTasks error:", message);
        return { success: false, message };
    }
}

/**
 * Manually assigns all pending tasks for a track to a specific mentor.
 * Used from the "View Details" modal on the Admin Dashboard.
 */
export async function assignTasksToMentor(trackId: string, mentorId: string): Promise<ReassignResult> {
    try {
        const supabase = await createClient();

        // 1. Verify admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, message: "Unauthorized" };
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || !["admin", "cdc_admin"].includes(profile.role)) {
            return { success: false, message: "Forbidden: Admin access required" };
        }

        // 2. Get roadmap item IDs for this track
        const { data: roadmapItems, error: riError } = await supabase
            .from("roadmap_items")
            .select("id")
            .eq("target_role_id", trackId);

        if (riError) {
            return { success: false, message: `Failed to fetch roadmap items: ${riError.message}` };
        }

        if (!roadmapItems || roadmapItems.length === 0) {
            return { success: false, message: "No roadmap items found for this track" };
        }

        const roadmapItemIds = roadmapItems.map((ri) => ri.id);

        // 3. Update all pending tasks for this track → assign to the chosen mentor
        const { data: updatedRows, error: updateError } = await supabase
            .from("student_progress")
            .update({ assigned_mentor_id: mentorId })
            .in("roadmap_item_id", roadmapItemIds)
            .eq("status", "pending")
            .select("id");

        if (updateError) {
            return { success: false, message: `Failed to assign tasks: ${updateError.message}` };
        }

        const count = updatedRows?.length ?? 0;

        // 4. Revalidate caches
        revalidatePath("/admin");
        revalidatePath("/mentor");

        return {
            success: true,
            message: `Assigned ${count} pending task${count !== 1 ? "s" : ""} to mentor`,
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        console.error("assignTasksToMentor error:", message);
        return { success: false, message };
    }
}
