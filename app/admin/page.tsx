import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TrendingUp, AlertTriangle, Radio } from "lucide-react";
import { getVerificationBottlenecks, getMentorWorkloads } from "@/lib/actions/bottlenecks";
import { getRecentBroadcasts } from "@/lib/actions/admin";
import { getRecentTelemetryEvents } from "@/lib/aws/cloudwatch";
import { BottlenecksSection } from "./components/BottlenecksSection";
import { TelemetrySection } from "./components/TelemetrySection";

// Supabase-ready mock data structures
interface TrackPerformance {
    name: string;
    students: number;
    avgScore: number;
}

// Mock data - easily replaceable with supabase.from('view_name').select('*')
const trackPerformance: TrackPerformance[] = [
    { name: "AI Engineer", students: 40, avgScore: 72 },
    { name: "Web Development", students: 120, avgScore: 55 },
    { name: "DevOps", students: 35, avgScore: 68 },
];

function getCategoryColor(category: string) {
    switch (category.toLowerCase()) {
        case "hiring":
        case "urgent":
            return "bg-red-500/10 text-red-500 border-red-500/20";
        case "update":
        case "technology":
            return "bg-orange-500/10 text-orange-500 border-orange-500/20";
        default:
            return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
}

function formatTimeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    // Fetch live data from Supabase in parallel
    const [bottlenecks, mentors, broadcasts, telemetryEvents] = await Promise.all([
        getVerificationBottlenecks(),
        getMentorWorkloads(),
        getRecentBroadcasts(),
        getRecentTelemetryEvents(),
    ]);

    return (
        <main className="flex-1 space-y-6 p-6">
            {/* Live AWS Telemetry & Observability Feed */}
            <TelemetrySection events={telemetryEvents} />

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

                {/* Right Column: Verification Bottlenecks - 40% (LIVE DATA) */}
                <div className="md:col-span-2">
                    <BottlenecksSection bottlenecks={bottlenecks} mentors={mentors} />
                </div>
            </div>

            {/* Row 3: Recent Market Updates (LIVE DATA) */}
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
                    {broadcasts.length === 0 ? (
                        <p className="text-sm text-zinc-500 text-center py-6">No broadcasts yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-400">Alert Title</TableHead>
                                    <TableHead className="text-zinc-400">Category</TableHead>
                                    <TableHead className="text-zinc-400">Sent</TableHead>
                                    <TableHead className="text-right text-zinc-400">Posted By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {broadcasts.map((broadcast) => (
                                    <TableRow
                                        key={broadcast.id}
                                        className="border-zinc-800 hover:bg-zinc-800/50"
                                    >
                                        <TableCell className="font-medium text-white">
                                            {broadcast.title}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`border-0 ${getCategoryColor(broadcast.category)}`}
                                            >
                                                {broadcast.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-400">
                                            {formatTimeAgo(broadcast.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right text-cyan-500">
                                            {broadcast.users?.full_name ?? "Admin"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
