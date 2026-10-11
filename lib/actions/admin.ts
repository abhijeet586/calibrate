"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface MarketUpdate {
    id: string;
    title: string;
    content: string;
    category: string;
    posted_by: string;
    created_at: string;
    users?: {
        full_name: string;
    } | null;
}

// Helper to check if the current user is an admin
async function requireAdmin() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (userError || !['admin', 'cdc_admin'].includes(userData?.role)) {
        throw new Error("Forbidden: Admin access required (role: " + userData?.role + ")");
    }

    return user;
}

export async function broadcastMarketUpdate(formData: FormData) {
    const supabase = await createClient();

    // 1. Securely verify admin access
    const user = await requireAdmin();

    // 2. Parse form data
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;

    if (!title || !content || !category) {
        throw new Error("Missing required fields");
    }

    // 3. Insert into the database
    const { error: insertError } = await supabase
        .from("market_updates")
        .insert({
            title,
            content,
            category,
            posted_by: user.id
        });

    if (insertError) {
        console.error("Error broadcasting market update:", insertError);
        throw new Error(insertError.message);
    }

    // 4. Revalidate necessary paths
    revalidatePath("/admin/market");
    revalidatePath("/student/feed");
    revalidatePath("/dashboard");
    revalidatePath("/student/roadmap");
}

export async function cleanupExpiredBroadcasts() {
    const supabase = await createClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { error } = await supabase
        .from("market_updates")
        .delete()
        .lt("created_at", thirtyDaysAgo.toISOString());

    if (error) {
        console.error("Error cleaning up expired broadcasts:", error);
    }
}

export async function deleteBroadcast(id: string) {
    const supabase = await createClient();
    await requireAdmin();

    const { error } = await supabase
        .from("market_updates")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting broadcast:", error);
        throw new Error(error.message);
    }

    revalidatePath("/admin/market");
    revalidatePath("/student/feed");
    revalidatePath("/dashboard");
}

export async function getRecentBroadcasts() {
    await cleanupExpiredBroadcasts();

    const supabase = await createClient();

    // Verify admin just in case, though usually server components handle authorization separately.
    // For safety we can require it here as well, or just fetch if they are accessing the admin page.
    await requireAdmin();

    const { data: updates, error } = await supabase
        .from("market_updates")
        .select("id, title, content, category, posted_by, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching recent broadcasts:", error);
        return [];
    }

    if (!updates || updates.length === 0) return [];

    const authorIds = [...new Set(updates.map(u => u.posted_by).filter(Boolean))];
    let authorMap: Record<string, string> = {};

    if (authorIds.length > 0) {
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", authorIds);

        if (profiles) {
            authorMap = Object.fromEntries(profiles.map(p => [p.id, p.full_name || ""]));
        }
    }

    return updates.map(item => ({
        ...item,
        users: item.posted_by && authorMap[item.posted_by]
            ? { full_name: authorMap[item.posted_by] }
            : null,
    })) as MarketUpdate[];
}

// ─── Track Management ───

export interface AdminTargetRole {
    id: string;
    name: string;
    required_skills: Record<string, any>;
    market_demand_score: number;
    created_at: string;
}

export async function createTargetRole(formData: FormData) {
    const supabase = await createClient();
    await requireAdmin();

    const name = formData.get("name") as string;
    const marketDemandScore = Number(formData.get("market_demand_score"));
    const requiredSkillsRaw = formData.get("required_skills") as string;

    if (!name || !marketDemandScore || !requiredSkillsRaw) {
        throw new Error("Missing required fields: name, market_demand_score, required_skills");
    }

    // Parse and validate JSON
    let requiredSkills: Record<string, any>;
    try {
        requiredSkills = JSON.parse(requiredSkillsRaw);
    } catch {
        throw new Error("required_skills must be valid JSON (e.g., {\"Python\": 100, \"TensorFlow\": 80})");
    }

    const { error } = await supabase
        .from("target_roles")
        .insert({
            name,
            market_demand_score: marketDemandScore,
            required_skills: requiredSkills,
        });

    if (error) {
        console.error("Error creating target role:", error);
        throw new Error(error.message);
    }

    revalidatePath("/admin/tracks");
    revalidatePath("/student/roles");
    revalidatePath("/student/target-roles");
    revalidatePath("/student/feed");
    revalidatePath("/student/progress");
}

export async function getAdminTargetRoles(): Promise<AdminTargetRole[]> {
    try {
        const supabase = await createClient();
        await requireAdmin();

        const { data, error } = await supabase
            .from("target_roles")
            .select("id, name, required_skills, market_demand_score, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("DB Error fetching target roles:", error.message || error);
            return [];
        }

        return (data || []) as AdminTargetRole[];
    } catch (err: any) {
        console.error("getAdminTargetRoles failed:", err?.message || err);
        return [];
    }
}

export async function deleteTargetRole(targetRoleId: string) {
    const supabase = await createClient();
    await requireAdmin();

    if (!targetRoleId) {
        throw new Error("Missing required field: targetRoleId");
    }

    try {
        // Step A: Fetch all ids from the roadmap_items table where target_role_id === targetRoleId
        const { data: roadmapItems, error: itemsError } = await supabase
            .from("roadmap_items")
            .select("id")
            .eq("target_role_id", targetRoleId);

        if (itemsError) throw itemsError;

        if (roadmapItems && roadmapItems.length > 0) {
            const roadmapItemIds = roadmapItems.map(item => item.id);

            // Step B: Delete all rows in the student_progress table where the roadmap_item_id matches
            const { error: progressError } = await supabase
                .from("student_progress")
                .delete()
                .in("roadmap_item_id", roadmapItemIds);

            if (progressError) throw progressError;
        }

        // Step C: Delete all rows in the roadmap_items table where target_role_id === targetRoleId
        const { error: deleteItemsError } = await supabase
            .from("roadmap_items")
            .delete()
            .eq("target_role_id", targetRoleId);

        if (deleteItemsError) throw deleteItemsError;

        // Step D: Delete the actual track in the target_roles table
        const { error: deleteRoleError } = await supabase
            .from("target_roles")
            .delete()
            .eq("id", targetRoleId);

        if (deleteRoleError) throw deleteRoleError;

        // 4. State & Cache Sync
        revalidatePath("/admin/tracks");
        revalidatePath("/admin/track-ops");
        revalidatePath("/student/roadmap");
        revalidatePath("/dashboard");

    } catch (error: any) {
        console.error("Error deleting target role:", error);
        throw new Error(error.message || "Failed to delete target role");
    }
}

// ─── Curriculum Management ───

export interface AdminCurriculumItem {
    id: string;
    target_role_id: string;
    task_instruction: string;
    resource_link: string | null;
    skill_id: string | null;
    created_at: string;
    market_skills?: {
        name: string;
    } | null;
}

export async function createRoadmapItem(formData: FormData) {
    const supabase = await createClient();
    await requireAdmin();

    const target_role_id = formData.get("target_role_id") as string;
    const task_instruction = formData.get("task_instruction") as string;
    const resource_link = formData.get("resource_link") as string;
    const skill_name = formData.get("skill_name") as string;

    if (!target_role_id || !task_instruction || !skill_name) {
        throw new Error("Missing required fields: target_role_id, task_instruction, or skill_name");
    }

    // 1. Normalize the skill name
    const normalizedName = skill_name.trim();

    // 2. Check if skill exists (case-insensitive)
    let finalSkillId: string | null = null;

    const { data: existingSkill } = await supabase
        .from("market_skills")
        .select("id")
        .ilike("name", normalizedName)
        .single();

    if (existingSkill) {
        finalSkillId = existingSkill.id;
    } else {
        // 3. Insert new skill if not found
        const { data: newSkill, error: skillError } = await supabase
            .from("market_skills")
            .insert({
                name: normalizedName,
                // Assign some default verified/mentions if needed, 
                // but usually just name is enough for the schema
            })
            .select("id")
            .single();

        if (skillError) {
            console.error("Error creating new market skill:", skillError);
            throw new Error(`Failed to create new skill: ${skillError.message}`);
        }
        finalSkillId = newSkill.id;
    }

    // 4. Insert Roadmap Item with the resolved skill ID
    const { data: newItem, error: itemError } = await supabase
        .from("roadmap_items")
        .insert({
            target_role_id,
            task_instruction,
            resource_link: resource_link || null,
            skill_id: finalSkillId,
            is_verified_task: true,
        })
        .select(`
            id,
            target_role_id,
            task_instruction,
            resource_link,
            skill_id,
            created_at,
            market_skills!roadmap_items_skill_id_fkey(
                name
            )
        `)
        .single();

    if (itemError) {
        console.error("Error creating roadmap item:", itemError);
        throw new Error(itemError.message);
    }

    revalidatePath("/admin/track-ops");
    revalidatePath("/student/roadmap");

    // Format the returned item to match the UI component's interface
    return {
        ...newItem,
        market_skills: Array.isArray(newItem.market_skills) ? newItem.market_skills[0] : newItem.market_skills
    } as AdminCurriculumItem;
}

export async function getAdminCurriculumItems(targetRoleId: string) {
    const supabase = await createClient();
    await requireAdmin();

    console.log("🔍 Admin Fetching tasks for Role ID:", targetRoleId);

    const { data, error } = await supabase
        .from("roadmap_items")
        .select(`
            id,
            target_role_id,
            task_instruction,
            resource_link,
            skill_id,
            created_at,
            market_skills(name)
        `) // removed the strict !fkey name to let Supabase auto-resolve
        .eq("target_role_id", targetRoleId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("❌ DB Error fetching curriculum items:", error.message);
        return [];
    }

    console.log(`✅ Success: Found ${data?.length || 0} items in DB`);

    return (data || []).map((item: any) => ({
        ...item,
        market_skills: Array.isArray(item.market_skills) ? item.market_skills[0] : item.market_skills
    })) as AdminCurriculumItem[];
}

export async function getAllSkills() {
    const supabase = await createClient();
    await requireAdmin();

    const { data, error } = await supabase
        .from("market_skills")
        .select("id, name")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching all skills:", error.message || error);
        return [];
    }

    return data || [];
}
