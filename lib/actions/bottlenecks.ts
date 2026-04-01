"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Types ───

export interface TrackBottleneck {
    track_id: string;
    track_name: string;
    pending_count: number;
    overloaded: boolean;
}

export interface MentorWorkload {
    mentor_id: string;
    full_name: string;
    active_count: number;
}

// ─── Data Fetching ───

/**
 * Calls the `get_track_bottlenecks` Postgres RPC to get pending verification
 * counts per career track. Used on the Admin Dashboard.
 */
export async function getVerificationBottlenecks(): Promise<TrackBottleneck[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_track_bottlenecks");

    if (error) {
        console.error("Error fetching track bottlenecks:", error.message);
        return [];
    }

    return (data ?? []) as TrackBottleneck[];
}

/**
 * Returns all mentors with their current count of assigned pending tasks.
 * Used by the reassignment algorithm to find the least-loaded mentor.
 */
export async function getMentorWorkloads(): Promise<MentorWorkload[]> {
    const supabase = await createClient();

    // 1. Fetch all mentor profiles
    const { data: mentors, error: mentorError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("role", "mentor");

    if (mentorError) {
        console.error("Error fetching mentors:", mentorError.message);
        return [];
    }

    if (!mentors || mentors.length === 0) {
        return [];
    }

    // 2. For each mentor, count their currently assigned pending tasks
    const workloads: MentorWorkload[] = await Promise.all(
        mentors.map(async (mentor) => {
            const { count, error: countError } = await supabase
                .from("student_progress")
                .select("id", { count: "exact", head: true })
                .eq("assigned_mentor_id", mentor.id)
                .eq("status", "pending");

            if (countError) {
                console.error(`Error counting workload for mentor ${mentor.id}:`, countError.message);
            }

            return {
                mentor_id: mentor.id,
                full_name: mentor.email ?? "Unknown Mentor",
                active_count: count ?? 0,
            };
        })
    );

    return workloads;
}
