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

const DEFAULT_MARKET_UPDATES: FeedItem[] = [
    {
        id: "default-frontend-1",
        title: "Next.js 16 & React 19 Server Actions Lead Frontend Demands",
        content: "Campus recruiters and enterprise tech firms report a 42% increase in hiring evaluations focusing on React 19 Server Components, Streaming SSR, and TypeScript UI architectures.",
        category: "Frontend",
        posted_by: "cdc-office",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        users: { full_name: "Abhijeet Senapati (CDC Director)" }
    },
    {
        id: "default-backend-1",
        title: "Microservices & Distributed Systems Mastery in High Demand",
        content: "Top cloud employers are screening candidates on high-throughput REST/gRPC backend APIs, PostgreSQL indexing optimization, and Dockerized microservice architecture.",
        category: "Backend",
        posted_by: "cdc-office",
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        users: { full_name: "Career Placement Advisory" }
    },
    {
        id: "default-ai-1",
        title: "Generative AI Orchestration & Vector Search Standard in 2026",
        content: "Engineering teams now expect new college graduates to possess hands-on familiarity with LLM integrations, RAG architectures, and AWS Bedrock / OpenAI API orchestration.",
        category: "AI",
        posted_by: "cdc-office",
        created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
        users: { full_name: "Industry Relations" }
    },
    {
        id: "default-cloud-1",
        title: "Enterprise Shift Toward Multi-Tier AWS Architectures & VPCs",
        content: "AWS Cloud Architect roles require demonstrable proof-of-work in Amazon S3 Evidence Vaults, IAM least-privilege policies, and CloudWatch telemetry pipelines.",
        category: "Cloud",
        posted_by: "cdc-office",
        created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
        users: { full_name: "AWS Cloud Partner Network" }
    },
    {
        id: "default-general-1",
        title: "CDC Placement Guideline: Proof-of-Work Portfolios Mandatory",
        content: "Campus recruitment drives now mandate live deployed cloud applications and verified GitHub proof-of-work submissions over static resumes.",
        category: "General",
        posted_by: "cdc-office",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        users: { full_name: "University Placement Cell" }
    }
];

export async function getMarketFeed(): Promise<FeedItem[]> {
    try {
        const supabase = await createClient();

        // 1. Fetch market updates from database
        const { data: updates, error } = await supabase
            .from("market_updates")
            .select("id, title, content, category, posted_by, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching market feed from DB, using fallback:", error);
            return DEFAULT_MARKET_UPDATES;
        }

        const dbUpdates = updates || [];

        // 2. Fetch author names from profiles/users
        const authorIds = [...new Set(dbUpdates.map(u => u.posted_by).filter(Boolean))];
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

        const mappedDbUpdates = dbUpdates.map(item => ({
            ...item,
            users: item.posted_by && authorMap[item.posted_by]
                ? { full_name: authorMap[item.posted_by] }
                : null,
        })) as FeedItem[];

        // Merge DB updates with defaults for any category not yet populated in DB
        const presentCategories = new Set(mappedDbUpdates.map(u => (u.category || "").toLowerCase()));
        const supplementalDefaults = DEFAULT_MARKET_UPDATES.filter(
            def => !presentCategories.has(def.category.toLowerCase())
        );

        return [...mappedDbUpdates, ...supplementalDefaults];
    } catch (err) {
        console.error("Unexpected error in getMarketFeed:", err);
        return DEFAULT_MARKET_UPDATES;
    }
}
