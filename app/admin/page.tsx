"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TrendingUp, AlertTriangle, Radio } from "lucide-react";

// Supabase-ready mock data structures
interface TrackPerformance {
    name: string;
    students: number;
    avgScore: number;
}

interface VerificationBottleneck {
    trackName: string;
    pending: number;
}

interface Broadcast {
    title: string;
    priority: "High" | "Medium" | "Low";
    sentTime: string;
    views: number;
}

// Mock data - easily replaceable with supabase.from('view_name').select('*')
const trackPerformance: TrackPerformance[] = [
    { name: "AI Engineer", students: 40, avgScore: 72 },
    { name: "Web Development", students: 120, avgScore: 55 },
    { name: "DevOps", students: 35, avgScore: 68 },
];

const verificationBottlenecks: VerificationBottleneck[] = [
    { trackName: "Full Stack", pending: 42 },
    { trackName: "AI & ML", pending: 23 },
    { trackName: "DevOps", pending: 18 },
];

const broadcasts: Broadcast[] = [
    { title: "Google Hiring Alert", priority: "High", sentTime: "2h ago", views: 450 },
    { title: "React 19 Update", priority: "High", sentTime: "2h ago", views: 450 },
    { title: "Python Workshop", priority: "Medium", sentTime: "1d ago", views: 280 },
    { title: "AWS Certification Webinar", priority: "Medium", sentTime: "2d ago", views: 195 },
    { title: "Library Maintenance Notice", priority: "Low", sentTime: "3d ago", views: 120 },
];

export default function AdminDashboard() {
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

    return (
        <main className="flex-1 space-y-6 p-6">
            {/* Row 1: The Pulse - 2 Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Batch Readiness
                        </CardTitle>
                        <TrendingUp className="size-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">62%</div>
                        <p className="text-xs text-zinc-500 mt-1">Up 4% since last broadcast</p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Pipeline Health
                        </CardTitle>
                        <AlertTriangle className="size-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">Critical</div>
                        <p className="text-xs text-zinc-500 mt-1">2 Tracks Overloaded</p>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: The Control Grid - 2 Columns */}
            <div className="grid gap-6 md:grid-cols-5">
                {/* Left Column: Track Performance - 60% */}
                <div className="md:col-span-3">
                    <Card className="border-zinc-800 bg-zinc-900">
                        <CardHeader>
                            <CardTitle className="text-white">Track Performance</CardTitle>
                            <p className="text-sm text-zinc-500">Student distribution and average scores</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {trackPerformance.map((track) => (
                                    <div
                                        key={track.name}
                                        className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4"
                                    >
                                        <div className="flex-1">
                                            <h4 className="font-medium text-white">{track.name}</h4>
                                            <p className="text-sm text-zinc-500">{track.students} Students</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-white">
                                                {track.avgScore}%
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`border-0 ${track.avgScore >= 70
                                                    ? "bg-cyan-500/10 text-cyan-500"
                                                    : "bg-red-500/10 text-red-500"
                                                    }`}
                                            >
                                                {track.avgScore >= 70 ? "Healthy" : "Needs Attention"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Verification Bottlenecks - 40% */}
                <div className="md:col-span-2">
                    <Card className="border-zinc-800 bg-zinc-900">
                        <CardHeader>
                            <CardTitle className="text-white">Verification Bottlenecks</CardTitle>
                            <p className="text-sm text-zinc-500">Monitor track workload and pending requests</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {verificationBottlenecks.map((track) => {
                                    const isOverloaded = track.pending > 20;
                                    const progressValue = Math.min((track.pending / 50) * 100, 100);

                                    return (
                                        <div
                                            key={track.trackName}
                                            className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-white">{track.trackName}</h4>
                                                    {isOverloaded && (
                                                        <AlertTriangle className="size-4 text-red-500" />
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-sm font-semibold ${isOverloaded ? "text-red-500" : "text-cyan-500"
                                                        }`}
                                                >
                                                    {track.pending} Pending
                                                </span>
                                            </div>
                                            <Progress
                                                value={progressValue}
                                                className="mb-3 h-2 bg-zinc-800"
                                                indicatorClassName={
                                                    isOverloaded ? "bg-red-500" : "bg-cyan-500"
                                                }
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`w-full border-zinc-800 text-xs shadow-none ${isOverloaded
                                                    ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:text-red-400"
                                                    : "bg-black/40 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                                    }`}
                                            >
                                                {isOverloaded ? "Reassign Tasks" : "View Details"}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Row 3: Recent Market Updates */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-white">Recent Market Updates Sent</CardTitle>
                        <p className="text-sm text-zinc-500 mt-1">Manual alerts broadcast to students</p>
                    </div>
                    <Button className="bg-cyan-500 text-black hover:bg-cyan-400">
                        <Radio className="mr-2 size-4" />
                        Broadcast New Alert
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Alert Title</TableHead>
                                <TableHead className="text-zinc-400">Priority</TableHead>
                                <TableHead className="text-zinc-400">Sent</TableHead>
                                <TableHead className="text-right text-zinc-400">Views</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {broadcasts.map((broadcast, index) => (
                                <TableRow
                                    key={index}
                                    className="border-zinc-800 hover:bg-zinc-800/50"
                                >
                                    <TableCell className="font-medium text-white">
                                        {broadcast.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`border-0 ${getPriorityColor(broadcast.priority)}`}
                                        >
                                            {broadcast.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">
                                        {broadcast.sentTime}
                                    </TableCell>
                                    <TableCell className="text-right text-cyan-500">
                                        {broadcast.views}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
