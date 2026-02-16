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
import { AlertCircle, CheckCircle, Clock, Users } from "lucide-react";

// Supabase-ready data structures
interface TrackWorkload {
    trackName: string;
    pending: number;
    completed: number;
    inProgress: number;
    avgResponseTime: string;
    mentorsAssigned: number;
}

// Mock data - easily replaceable with supabase.from('track_workloads').select('*')
const trackWorkloads: TrackWorkload[] = [
    {
        trackName: "Full Stack",
        pending: 42,
        completed: 128,
        inProgress: 15,
        avgResponseTime: "2.5 days",
        mentorsAssigned: 5,
    },
    {
        trackName: "AI & ML",
        pending: 23,
        completed: 87,
        inProgress: 8,
        avgResponseTime: "1.8 days",
        mentorsAssigned: 3,
    },
    {
        trackName: "DevOps",
        pending: 18,
        completed: 65,
        inProgress: 6,
        avgResponseTime: "2.1 days",
        mentorsAssigned: 2,
    },
    {
        trackName: "Mobile Dev",
        pending: 12,
        completed: 54,
        inProgress: 4,
        avgResponseTime: "1.5 days",
        mentorsAssigned: 2,
    },
    {
        trackName: "Data Engineering",
        pending: 8,
        completed: 41,
        inProgress: 3,
        avgResponseTime: "1.9 days",
        mentorsAssigned: 2,
    },
    {
        trackName: "Cybersecurity",
        pending: 5,
        completed: 28,
        inProgress: 2,
        avgResponseTime: "1.2 days",
        mentorsAssigned: 1,
    },
];

export default function TrackOpsPage() {
    const totalPending = trackWorkloads.reduce((sum, track) => sum + track.pending, 0);
    const totalCompleted = trackWorkloads.reduce((sum, track) => sum + track.completed, 0);
    const totalInProgress = trackWorkloads.reduce((sum, track) => sum + track.inProgress, 0);
    const totalMentors = trackWorkloads.reduce((sum, track) => sum + track.mentorsAssigned, 0);

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Track Operations</h1>
                    <p className="text-sm text-zinc-500">Monitor verification workload across all career tracks</p>
                </div>
                <Button className="bg-cyan-500 text-black hover:bg-cyan-400">
                    Reassign Tasks
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <AlertCircle className="size-5 text-red-500" />
                        </div>
                        <div className="text-2xl font-bold text-red-500">{totalPending}</div>
                        <p className="text-sm text-zinc-400">Pending Requests</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <Clock className="size-5 text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold text-orange-500">{totalInProgress}</div>
                        <p className="text-sm text-zinc-400">In Progress</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <CheckCircle className="size-5 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-green-500">{totalCompleted}</div>
                        <p className="text-sm text-zinc-400">Completed</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <Users className="size-5 text-cyan-500" />
                        </div>
                        <div className="text-2xl font-bold text-cyan-500">{totalMentors}</div>
                        <p className="text-sm text-zinc-400">Active Mentors</p>
                    </CardContent>
                </Card>
            </div>

            {/* Track Workload Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                {trackWorkloads.map((track) => {
                    const isOverloaded = track.pending > 20;
                    const progressValue = Math.min((track.pending / 50) * 100, 100);
                    const completionRate = Math.round(
                        (track.completed / (track.completed + track.pending + track.inProgress)) * 100
                    );

                    return (
                        <Card key={track.trackName} className="border-zinc-800 bg-zinc-900">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-white">{track.trackName}</CardTitle>
                                        <p className="text-sm text-zinc-500 mt-1">{track.mentorsAssigned} mentors assigned</p>
                                    </div>
                                    {isOverloaded && <AlertCircle className="size-5 text-red-500" />}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Pending Progress */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm text-zinc-400">Pending Requests</span>
                                        <span
                                            className={`text-sm font-semibold ${isOverloaded ? "text-red-500" : "text-cyan-500"
                                                }`}
                                        >
                                            {track.pending}
                                        </span>
                                    </div>
                                    <Progress
                                        value={progressValue}
                                        className="h-2 bg-zinc-800"
                                        indicatorClassName={isOverloaded ? "bg-red-500" : "bg-cyan-500"}
                                    />
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                                        <p className="text-xs text-zinc-500">In Progress</p>
                                        <p className="mt-1 text-lg font-semibold text-orange-500">{track.inProgress}</p>
                                    </div>
                                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                                        <p className="text-xs text-zinc-500">Completed</p>
                                        <p className="mt-1 text-lg font-semibold text-green-500">{track.completed}</p>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Avg Response Time</span>
                                        <span className="text-xs font-medium text-white">{track.avgResponseTime}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Completion Rate</span>
                                        <Badge
                                            variant="outline"
                                            className={`border-0 ${completionRate >= 70
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-orange-500/10 text-orange-500"
                                                }`}
                                        >
                                            {completionRate}%
                                        </Badge>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`w-full border-zinc-800 shadow-none ${isOverloaded
                                        ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:text-red-400"
                                        : "bg-black/40 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                        }`}
                                >
                                    {isOverloaded ? "Urgent: Reassign" : "Manage Workload"}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Detailed Table */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-white">Detailed Workload Overview</CardTitle>
                    <p className="text-sm text-zinc-500">Complete breakdown of verification requests by track</p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Track Name</TableHead>
                                <TableHead className="text-zinc-400">Pending</TableHead>
                                <TableHead className="text-zinc-400">In Progress</TableHead>
                                <TableHead className="text-zinc-400">Completed</TableHead>
                                <TableHead className="text-zinc-400">Mentors</TableHead>
                                <TableHead className="text-zinc-400">Avg Response</TableHead>
                                <TableHead className="text-right text-zinc-400">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trackWorkloads.map((track) => {
                                const isOverloaded = track.pending > 20;
                                return (
                                    <TableRow key={track.trackName} className="border-zinc-800 hover:bg-zinc-800/50">
                                        <TableCell className="font-medium text-white">{track.trackName}</TableCell>
                                        <TableCell className={isOverloaded ? "text-red-500" : "text-zinc-400"}>
                                            {track.pending}
                                        </TableCell>
                                        <TableCell className="text-orange-500">{track.inProgress}</TableCell>
                                        <TableCell className="text-green-500">{track.completed}</TableCell>
                                        <TableCell className="text-cyan-500">{track.mentorsAssigned}</TableCell>
                                        <TableCell className="text-zinc-400">{track.avgResponseTime}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant="outline"
                                                className={`border-0 ${isOverloaded
                                                    ? "bg-red-500/10 text-red-500"
                                                    : "bg-green-500/10 text-green-500"
                                                    }`}
                                            >
                                                {isOverloaded ? "Overloaded" : "Healthy"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
