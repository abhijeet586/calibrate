import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Radio, TrendingUp, Briefcase, Eye } from "lucide-react";
import { getRecentBroadcasts, MarketUpdate } from "@/lib/actions/admin";
import BroadcastFormClient from "./BroadcastFormClient";
import DeleteBroadcastButton from "./DeleteBroadcastButton";

export const dynamic = "force-dynamic";

// ─── Data Types & Mocks ────────────────────────────────────────

interface MarketTrend {
    id: string;
    technology: string;
    trend: "rising" | "stable" | "declining";
    demandScore: number;
    companies: number;
    avgSalary: string;
}

const marketTrends: MarketTrend[] = [
    {
        id: "1",
        technology: "React 19",
        trend: "rising",
        demandScore: 95,
        companies: 142,
        avgSalary: "₹18-25L",
    },
    {
        id: "2",
        technology: "AI/ML Engineers",
        trend: "rising",
        demandScore: 98,
        companies: 89,
        avgSalary: "₹25-40L",
    },
    {
        id: "3",
        technology: "Kubernetes",
        trend: "rising",
        demandScore: 92,
        companies: 76,
        avgSalary: "₹20-30L",
    },
    {
        id: "4",
        technology: "Python",
        trend: "stable",
        demandScore: 88,
        companies: 234,
        avgSalary: "₹15-22L",
    },
    {
        id: "5",
        technology: "Angular",
        trend: "declining",
        demandScore: 62,
        companies: 45,
        avgSalary: "₹12-18L",
    },
];

// ─── Helpers ───────────────────────────────────────────────────

const getPriorityColor = (priority: string) => {
    // Map our DB "category" (high/medium/low) safely to ui colors
    switch (priority.toLowerCase()) {
        case "high":
            return "bg-red-500/10 text-red-500 border-red-500/20";
        case "medium":
            return "bg-orange-500/10 text-orange-500 border-orange-500/20";
        case "low":
            return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
        default:
            return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
};

const getTrendColor = (trend: string) => {
    switch (trend) {
        case "rising":
            return "text-green-500";
        case "stable":
            return "text-orange-500";
        case "declining":
            return "text-red-500";
        default:
            return "text-zinc-400";
    }
};

// ─── Main Server Component ─────────────────────────────────────

export default async function MarketIntelligencePage() {
    // Determine the recent live broadcasts directly from our server actions mapping
    let recentBroadcasts: MarketUpdate[] = [];
    try {
        recentBroadcasts = await getRecentBroadcasts();
    } catch (e) {
        console.error("Failed to load broadcasts", e);
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Market Intelligence</h1>
                <p className="text-sm text-zinc-500">Broadcast market trends and opportunities to students</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <Radio className="size-5 text-cyan-500" />
                        </div>
                        <div className="text-2xl font-bold text-white">{recentBroadcasts.length}</div>
                        <p className="text-sm text-zinc-400">Total Broadcasts</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <Eye className="size-5 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-green-500">--</div>
                        <p className="text-sm text-zinc-400">Total Views</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <Briefcase className="size-5 text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold text-orange-500">586</div>
                        <p className="text-sm text-zinc-400">Active Companies</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Clean Extracted Broadcast Form Client */}
                <BroadcastFormClient />

                {/* Market Trends (Mock for now until schema supports it) */}
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-white">Current Market Trends</CardTitle>
                        <p className="text-sm text-zinc-500">Live demand for technologies</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {marketTrends.map((trend) => (
                                <div
                                    key={trend.id}
                                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-white">{trend.technology}</h4>
                                            <TrendingUp className={`size-4 ${getTrendColor(trend.trend)}`} />
                                        </div>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                                            <span>{trend.companies} companies</span>
                                            <span>•</span>
                                            <span>{trend.avgSalary}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-semibold text-cyan-500">{trend.demandScore}</div>
                                        <div className="text-xs text-zinc-500">Demand</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Broadcasts Table */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-white">Recent Broadcasts</CardTitle>
                    <p className="text-sm text-zinc-500">History of sent market updates</p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Alert Title</TableHead>
                                <TableHead className="text-zinc-400">Content Preview</TableHead>
                                <TableHead className="text-zinc-400">Priority</TableHead>
                                <TableHead className="text-zinc-400">Sent Date</TableHead>
                                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentBroadcasts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                                        No broadcasts sent yet. Use the form above to send your first alert.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentBroadcasts.map((broadcast) => (
                                    <TableRow key={broadcast.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                        <TableCell className="font-medium text-white">{broadcast.title}</TableCell>
                                        <TableCell className="text-zinc-400 max-w-[200px] truncate" title={broadcast.content}>
                                            {broadcast.content}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`border-0 capitalize ${getPriorityColor(broadcast.category)}`}
                                            >
                                                {broadcast.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-400">
                                            {new Date(broadcast.created_at).toLocaleDateString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DeleteBroadcastButton id={broadcast.id} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
