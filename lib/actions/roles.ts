"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserId } from "@/lib/actions/userId";

export interface TargetRole {
    id: string;
    name: string;
    required_skills: any;
    market_demand_score: number;
}

export async function getAllTargetRoles() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("target_roles")
        .select("id, name, required_skills, market_demand_score")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching target roles:", error);
        throw new Error(error.message);
    }

    return (data || []) as TargetRole[];
}

export async function getStudentTargetRole(studentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("student_target_roles")
        .select("role_id")
        .eq("student_id", studentId)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching student target role:", error);
        throw new Error(error.message);
    }

    return data?.role_id || null;
}

export async function selectTargetRole(roleId: string) {
    const supabase = await createClient();
    const studentId = await getUserId();

    // Check if a role is already selected to decide between insert or update
    // Supabase .upsert() is cleaner if we have a unique constraint on student_id
    // Assuming student_id is unique in student_target_roles for a simple one-role-per-student model

    const { error } = await supabase
        .from("student_target_roles")
        .upsert({
            student_id: studentId,
            role_id: roleId,
        }, {
            onConflict: 'student_id'
        });

    if (error) {
        console.error("Error selecting target role:", error);
        throw new Error(error.message);
    }

    revalidatePath("/student/progress");
    revalidatePath("/student/target-roles");
    revalidatePath("/dashboard");
    revalidatePath("/student/feed");
}
