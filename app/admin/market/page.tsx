"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Radio, TrendingUp, Briefcase, Send, Eye } from "lucide-react";

// Supabase-ready data structures
interface MarketTrend {
    id: string;
    technology: string;
    trend: "rising" | "stable" | "declining";
    demandScore: number;
    companies: number;
    avgSalary: string;
}

interface Broadcast {
    id: string;
    title: string;
    priority: "High" | "Medium" | "Low";
    sentTime: string;
    views: number;
    targetTrack: string;
}

// Mock data - easily replaceable with supabase.from('market_trends').select('*')
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

const recentBroadcasts: Broadcast[] = [
    {
        id: "1",
        title: "Google Hiring Alert",
        priority: "High",
        sentTime: "2h ago",
        views: 450,
        targetTrack: "All Tracks",
    },
    {
        id: "2",
        title: "React 19 Update",
        priority: "High",
        sentTime: "2h ago",
        views: 450,
        targetTrack: "Full Stack",
    },
    {
        id: "3",
        title: "Python Workshop",
        priority: "Medium",
        sentTime: "1d ago",
        views: 280,
        targetTrack: "AI & ML",
    },
    {
        id: "4",
        title: "AWS Certification Webinar",
        priority: "Medium",
        sentTime: "2d ago",
        views: 195,
        targetTrack: "DevOps",
    },
];

export default function MarketIntelligencePage() {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "High":
                return "bg-red-500/10 text-red-500 border-red-500/20";
            case "Medium":
                return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            case "Low":
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
                        <div className="text-2xl font-bold text-white">24</div>
                        <p className="text-sm text-zinc-400">Total Broadcasts</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <Eye className="size-5 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-green-500">5,420</div>
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
                {/* Broadcast Form */}
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-white">Broadcast New Alert</CardTitle>
                        <p className="text-sm text-zinc-500">Send market updates to students</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-zinc-300">
                                Alert Title
                            </Label>
                            <Input
                                id="title"
                                placeholder="e.g., Google Hiring Alert"
                                className="border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-zinc-300">
                                Message
                            </Label>
                            <Textarea
                                id="message"
                                placeholder="Enter your market update or opportunity details..."
                                rows={4}
                                className="border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="priority" className="text-zinc-300">
                                    Priority
                                </Label>
                                <Select defaultValue="medium">
                                    <SelectTrigger
                                        id="priority"
                                        className="border-zinc-700 bg-zinc-950 text-white"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="track" className="text-zinc-300">
                                    Target Track
                                </Label>
                                <Select defaultValue="all">
                                    <SelectTrigger
                                        id="track"
                                        className="border-zinc-700 bg-zinc-950 text-white"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tracks</SelectItem>
                                        <SelectItem value="fullstack">Full Stack</SelectItem>
                                        <SelectItem value="aiml">AI & ML</SelectItem>
                                        <SelectItem value="devops">DevOps</SelectItem>
                                        <SelectItem value="mobile">Mobile Dev</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
                            <Send className="mr-2 size-4" />
                            Send Broadcast
                        </Button>
                    </CardContent>
                </Card>

                {/* Market Trends */}
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
                                <TableHead className="text-zinc-400">Target Track</TableHead>
                                <TableHead className="text-zinc-400">Priority</TableHead>
                                <TableHead className="text-zinc-400">Sent</TableHead>
                                <TableHead className="text-right text-zinc-400">Views</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentBroadcasts.map((broadcast) => (
                                <TableRow key={broadcast.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableCell className="font-medium text-white">{broadcast.title}</TableCell>
                                    <TableCell className="text-zinc-400">{broadcast.targetTrack}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`border-0 ${getPriorityColor(broadcast.priority)}`}
                                        >
                                            {broadcast.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">{broadcast.sentTime}</TableCell>
                                    <TableCell className="text-right text-cyan-500">{broadcast.views}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
