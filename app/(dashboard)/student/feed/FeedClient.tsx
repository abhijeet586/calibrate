"use client";

import { useState } from "react";
import { FeedCard } from "@/components/student/FeedCard";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import { FeedItem } from "@/lib/actions/feed";

const FILTER_TABS = ["All", "Frontend", "Backend", "AI", "General"];

// Helper to format timestamps to relative time strings
function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function FeedClient({ initialFeed }: { initialFeed: FeedItem[] }) {
    const [activeFilter, setActiveFilter] = useState("All");

    // Filter items based on the active tab (matching by category from DB)
    const filteredFeed = initialFeed.filter(item => {
        if (activeFilter === "All") return true;
        // The DB might have "High", "Medium", "Low" priority as "category", or tracks like "Full Stack". 
        // We do a loose match or string inclusion.
        return item.category?.toLowerCase() === activeFilter.toLowerCase() ||
            item.title.toLowerCase().includes(activeFilter.toLowerCase()) ||
            item.content.toLowerCase().includes(activeFilter.toLowerCase());
    });

    return (
        <div className="flex-1 space-y-6">
            {/* Header */}
            <div>
                <h1 className="mb-6 text-3xl font-bold text-white">Market Pulse</h1>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    {FILTER_TABS.map((tab) => (
                        <Button
                            key={tab}
                            variant={activeFilter === tab ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveFilter(tab)}
                            className={
                                activeFilter === tab
                                    ? "bg-cyan-400 text-black hover:bg-cyan-500 font-semibold"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            }
                        >
                            {tab}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Feed Cards */}
            <div className="space-y-4">
                {filteredFeed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 border border-zinc-800/50 rounded-xl bg-zinc-900/20">
                        <Inbox className="w-10 h-10 mb-4 text-zinc-600" />
                        <h3 className="text-lg font-medium text-white mb-1">No updates found</h3>
                        <p className="text-sm">There are no market updates available for "{activeFilter}" right now.</p>
                    </div>
                ) : (
                    filteredFeed.map((item) => (
                        <FeedCard
                            key={item.id}
                            title={item.title}
                            // Using the DB category (e.g., Priority) for the tag
                            tag={item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                            time={timeAgo(item.created_at)}
                            // We don't have a rigid "company" entity directly on the update, 
                            // but we can use the Admin's name or a piece of the content text.
                            company={item.users?.full_name || "MarketReady Admin"}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
