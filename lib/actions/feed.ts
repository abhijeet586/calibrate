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

    // Authenticated users only, but any role can read the feed
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
        .from("market_updates")
        .select(`
            id,
            title,
            content,
            category,
            posted_by,
            created_at,
            users:posted_by (
                full_name
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching market feed:", error);
        throw new Error(error.message);
    }

    return (data || []) as unknown as FeedItem[];
}
