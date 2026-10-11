"use server";

import { createClient } from "@/lib/supabase/server";

export interface FeedItem {
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

export async function getMarketFeed() {
    const supabase = await createClient();

    // 1. Fetch market updates
    const { data: updates, error } = await supabase
        .from("market_updates")
        .select("id, title, content, category, posted_by, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching market feed:", error);
        return [];
    }

    if (!updates || updates.length === 0) {
        return [];
    }

    // 2. Fetch author names from profiles/users
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
    })) as FeedItem[];
}
