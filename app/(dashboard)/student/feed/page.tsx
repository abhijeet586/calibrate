"use client";

import { useState } from "react";
import { FeedCard } from "@/components/student/FeedCard";
import { ScoreWidget } from "@/components/student/ScoreWidget";
import { FocusWidget } from "@/components/student/FocusWidget";
import { HotSkillsWidget } from "@/components/student/HotSkillsWidget";
import { Button } from "@/components/ui/button";

const MOCK_FEED = [
    {
        id: 1,
        title: "React 19 is officially out. Here is what changed.",
        tag: "Frontend",
        time: "2h ago",
        company: "React Team"
    },
    {
        id: 2,
        title: "Next.js 15 introduces Partial Prerendering for hybrid rendering strategies.",
        tag: "Frontend",
        time: "4h ago",
        company: "Vercel"
    },
    {
        id: 3,
        title: "GPT-5 training completed. API access rolling out to enterprise customers.",
        tag: "AI",
        time: "8h ago",
        company: "OpenAI"
    },
    {
        id: 4,
        title: "Rust adoption growing 40% YoY in systems programming roles.",
        tag: "Backend",
        time: "1d ago",
        company: "Stack Overflow"
    },
];

const FILTER_TABS = ["All", "Frontend", "Backend", "AI"];

export default function FeedPage() {
    const [activeFilter, setActiveFilter] = useState("All");

    return (
        <div className="flex h-full gap-6">
            {/* Main Feed Column */}
            <div className="flex-1 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="mb-6 text-3xl font-bold text-white">Market Pulse</h1>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {FILTER_TABS.map((tab) => (
                            <Button
                                key={tab}
                                variant={activeFilter === tab ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setActiveFilter(tab)}
                                className={
                                    activeFilter === tab
                                        ? "bg-cyan-400 text-black hover:bg-cyan-500"
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
                    {MOCK_FEED.map((item) => (
                        <FeedCard
                            key={item.id}
                            title={item.title}
                            tag={item.tag}
                            time={item.time}
                            company={item.company}
                        />
                    ))}
                </div>
            </div>

            {/* Right Widgets Column */}
            <div className="w-80 space-y-6">
                <ScoreWidget />
                <FocusWidget />
                <HotSkillsWidget />
            </div>
        </div>
    );
}
