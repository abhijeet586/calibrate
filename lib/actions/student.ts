'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// TODO: Implement skill verification logic
export async function verifySkill(studentId: string, skillId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('skill_verifications')
        .insert({
            student_id: studentId,
            skill_id: skillId,
            verified_at: new Date().toISOString(),
        })

    if (error) {
        console.error('Error verifying skill:', error)
        return { success: false }
    }

    return { success: true }
}

export interface StudentTargetRole {
    id: string;
    name: string;
    required_skills: Record<string, any>;
    market_demand_score: number;
}

export async function getAllRolesForStudent() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("target_roles")
            .select("id, name, required_skills, market_demand_score")
            .order("market_demand_score", { ascending: false });

        if (error) {
            console.error("Error fetching roles for student:", error);
            return [];
        }

        return (data || []) as StudentTargetRole[];
    } catch (err) {
        console.error("Exception fetching roles for student:", err);
        return [];
    }
}

export async function assignTargetRole(roleId: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // Clear any existing active role for this student first
    await supabase
        .from("student_target_roles")
        .delete()
        .eq("student_id", user.id);

    // Insert the new chosen target role
    const { error } = await supabase
        .from("student_target_roles")
        .insert({
            student_id: user.id,
            role_id: roleId,
        });

    if (error) {
        console.error("Error assigning target role:", error);
        throw new Error(error.message);
    }

    revalidatePath("/student/roles");
    revalidatePath("/student/target-roles");
    revalidatePath("/student/feed");
    revalidatePath("/student/progress");
}

export async function getStudentCurrentRole() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return null;
    }

    try {
        const { data, error } = await supabase
            .from("student_target_roles")
            .select("role_id")
            .eq("student_id", user.id)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching current role:", error);
            return null;
        }

        return data?.role_id || null;
    } catch {
        return null;
    }
}
