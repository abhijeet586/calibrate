"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Code, Brain, Server, Smartphone, Database, Shield, Edit, Plus } from "lucide-react";

// Supabase-ready data structures
interface TrackSkill {
    name: string;
    weight: number;
}

interface CareerTrack {
    id: string;
    name: string;
    icon: React.ReactNode;
    students: number;
    avgScore: number;
    skills: TrackSkill[];
    status: "active" | "draft";
}

// Mock data - easily replaceable with supabase.from('career_tracks').select('*')
const careerTracks: CareerTrack[] = [
    {
        id: "1",
        name: "Full Stack Development",
        icon: <Code className="size-5" />,
        students: 120,
        avgScore: 68,
        skills: [
            { name: "React", weight: 25 },
            { name: "Node.js", weight: 25 },
            { name: "Database", weight: 20 },
            { name: "System Design", weight: 15 },
            { name: "DevOps", weight: 15 },
        ],
        status: "active",
    },
    {
        id: "2",
        name: "AI & Machine Learning",
        icon: <Brain className="size-5" />,
        students: 40,
        avgScore: 72,
        skills: [
            { name: "Python", weight: 20 },
            { name: "ML Algorithms", weight: 30 },
            { name: "Deep Learning", weight: 25 },
            { name: "Data Processing", weight: 15 },
            { name: "MLOps", weight: 10 },
        ],
        status: "active",
    },
    {
        id: "3",
        name: "DevOps Engineering",
        icon: <Server className="size-5" />,
        students: 35,
        avgScore: 65,
        skills: [
            { name: "CI/CD", weight: 25 },
            { name: "Cloud (AWS/Azure)", weight: 30 },
            { name: "Kubernetes", weight: 20 },
            { name: "Monitoring", weight: 15 },
            { name: "Security", weight: 10 },
        ],
        status: "active",
    },
    {
        id: "4",
        name: "Mobile Development",
        icon: <Smartphone className="size-5" />,
        students: 28,
        avgScore: 70,
        skills: [
            { name: "React Native", weight: 30 },
            { name: "iOS Development", weight: 25 },
            { name: "Android Development", weight: 25 },
            { name: "API Integration", weight: 15 },
            { name: "Performance", weight: 5 },
        ],
        status: "active",
    },
    {
        id: "5",
        name: "Data Engineering",
        icon: <Database className="size-5" />,
        students: 22,
        avgScore: 69,
        skills: [
            { name: "SQL/NoSQL", weight: 25 },
            { name: "ETL Pipelines", weight: 30 },
            { name: "Big Data (Spark)", weight: 20 },
            { name: "Data Warehousing", weight: 15 },
            { name: "Cloud Data", weight: 10 },
        ],
        status: "active",
    },
    {
        id: "6",
        name: "Cybersecurity",
        icon: <Shield className="size-5" />,
        students: 15,
        avgScore: 74,
        skills: [
            { name: "Network Security", weight: 25 },
            { name: "Penetration Testing", weight: 25 },
            { name: "Cryptography", weight: 20 },
            { name: "Security Tools", weight: 20 },
            { name: "Compliance", weight: 10 },
        ],
        status: "draft",
    },
];

export default function CareerTracksPage() {
    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Career Tracks</h1>
                    <p className="text-sm text-zinc-500">Manage curriculum and skill weightage for each track</p>
                </div>
                <Button className="bg-cyan-500 text-black hover:bg-cyan-400">
                    <Plus className="mr-2 size-4" />
                    Create New Track
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-white">6</div>
                        <p className="text-sm text-zinc-400">Total Tracks</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-cyan-500">260</div>
                        <p className="text-sm text-zinc-400">Total Students</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-500">69.6%</div>
                        <p className="text-sm text-zinc-400">Avg Success Rate</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-orange-500">5</div>
                        <p className="text-sm text-zinc-400">Active Tracks</p>
                    </CardContent>
                </Card>
            </div>

            {/* Career Tracks Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {careerTracks.map((track) => (
                    <Card key={track.id} className="border-zinc-800 bg-zinc-900">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                                        {track.icon}
                                    </div>
                                    <div>
                                        <CardTitle className="text-white">{track.name}</CardTitle>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-sm text-zinc-500">{track.students} Students</span>
                                            <span className="text-zinc-700">•</span>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    track.status === "active"
                                                        ? "border-0 bg-green-500/10 text-green-500"
                                                        : "border-0 bg-zinc-500/10 text-zinc-400"
                                                }
                                            >
                                                {track.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                                    <Edit className="size-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Average Score */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-zinc-400">Average Score</span>
                                    <span className="text-sm font-semibold text-white">{track.avgScore}%</span>
                                </div>
                                <Progress
                                    value={track.avgScore}
                                    className="h-2 bg-zinc-800"
                                    indicatorClassName={
                                        track.avgScore >= 70 ? "bg-green-500" : track.avgScore >= 60 ? "bg-orange-500" : "bg-red-500"
                                    }
                                />
                            </div>

                            {/* Skills Weightage */}
                            <div>
                                <h4 className="mb-3 text-sm font-medium text-zinc-400">Skill Weightage</h4>
                                <div className="space-y-2">
                                    {track.skills.map((skill) => (
                                        <div key={skill.name} className="flex items-center justify-between">
                                            <span className="text-sm text-zinc-300">{skill.name}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800">
                                                    <div
                                                        className="h-full bg-cyan-500"
                                                        style={{ width: `${skill.weight * 3.33}%` }}
                                                    />
                                                </div>
                                                <span className="w-8 text-right text-xs text-zinc-500">{skill.weight}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
