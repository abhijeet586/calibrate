"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Inbox,
    Activity,
    AlertTriangle,
    ExternalLink,
    Check,
    X,
    CheckCircle2,
    TrendingUp,
    Clock,
} from "lucide-react";

// Mock Data - Matching Figma Design
interface Verification {
    id: string;
    student: {
        name: string;
        avatar: string;
    };
    taskName: string;
    marketDemand: 'high' | 'low' | 'medium';
    proofUrl: string;
    submittedTime: string;
    status: 'pending' | 'approved' | 'rejected';
}

const mockData: Verification[] = [
    {
        id: 'VER-1024',
        student: { name: 'Pratyush Raj', avatar: 'PR' },
        taskName: 'Learn Next.js Fundamentals',
        marketDemand: 'high',
        proofUrl: '#',
        submittedTime: '2h ago',
        status: 'pending',
    },
    {
        id: 'VER-1023',
        student: { name: 'Raghav Jee Ojha', avatar: 'RJ' },
        taskName: 'Build REST API with Node',
        marketDemand: 'high',
        proofUrl: '#',
        submittedTime: '3h ago',
        status: 'pending',
    },
    {
        id: 'VER-1022',
        student: { name: 'A V Yashwanth Kumar', avatar: 'AY' },
        taskName: 'React Component Architecture',
        marketDemand: 'high',
        proofUrl: '#',
        submittedTime: '5h ago',
        status: 'pending',
    },
    {
        id: 'VER-1021',
        student: { name: 'Priya Desai', avatar: 'PD' },
        taskName: 'Figma UI Design Project',
        marketDemand: 'medium',
        proofUrl: '#',
        submittedTime: '6h ago',
        status: 'pending',
    },
    {
        id: 'VER-1020',
        student: { name: 'Arjun Patel', avatar: 'AP' },
        taskName: 'React Hooks Deep Dive',
        marketDemand: 'high',
        proofUrl: '#',
        submittedTime: '8h ago',
        status: 'pending',
    },
];

interface Activity {
    id: string;
    studentName: string;
    taskName: string;
    timeAgo: string;
    type: 'completed' | 'submitted';
}

const activities: Activity[] = [
    {
        id: '1',
        studentName: 'Pratyush Raj',
        taskName: 'SQL Basics',
        timeAgo: '10m ago',
        type: 'completed',
    },
    {
        id: '2',
        studentName: 'Raghav Jee Ojha',
        taskName: 'Figma Design',
        timeAgo: '1h ago',
        type: 'completed',
    },
    {
        id: '3',
        studentName: 'A V Yashwanth Kumar',
        taskName: 'JavaScript Arrays',
        timeAgo: '2h ago',
        type: 'completed',
    },
    {
        id: '4',
        studentName: 'Priya Desai',
        taskName: 'CSS Flexbox',
        timeAgo: '3h ago',
        type: 'submitted',
    },
    {
        id: '5',
        studentName: 'Arjun Patel',
        taskName: 'API Integration',
        timeAgo: '4h ago',
        type: 'completed',
    },
    {
        id: '6',
        studentName: 'Pratyush Raj',
        taskName: 'TypeScript Basics',
        timeAgo: '5h ago',
        type: 'completed',
    },
    {
        id: '7',
        studentName: 'Raghav Jee Ojha',
        taskName: 'Git Workflow',
        timeAgo: '6h ago',
        type: 'submitted',
    },
    {
        id: '8',
        studentName: 'A V Yashwanth Kumar',
        taskName: 'Docker Basics',
        timeAgo: '7h ago',
        type: 'completed',
    },
];

const kpis = [
    {
        label: 'Pending Verifications',
        value: '12',
        icon: Inbox,
        color: 'cyan',
        trend: null,
    },
    {
        label: 'Batch Market Score',
        value: '68%',
        icon: Activity,
        color: 'green',
        trend: 'up',
    },
    {
        label: 'At-Risk Students',
        value: '5',
        icon: AlertTriangle,
        color: 'red',
        trend: null,
    },
];

export default function MentorPage() {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [verifications, setVerifications] = useState<Verification[]>(mockData);

    const filteredData = verifications.filter((v) => v.status === activeTab);

    const handleApprove = (id: string) => {
        setVerifications((prev) =>
            prev.map((v) => (v.id === id ? { ...v, status: 'approved' as const } : v))
        );
    };

    const handleReject = (id: string) => {
        setVerifications((prev) =>
            prev.map((v) => (v.id === id ? { ...v, status: 'rejected' as const } : v))
        );
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top KPI Cards */}
            <div className="p-6 pb-3">
                <div className="grid grid-cols-3 gap-4">
                    {kpis.map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                            <div
                                key={kpi.label}
                                className="bg-[#18181b] border border-[#27272a] rounded-lg p-5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                                            {kpi.label}
                                        </p>
                                        <div className="flex items-end gap-2">
                                            <p
                                                className={`text-3xl font-semibold ${kpi.color === 'cyan'
                                                    ? 'text-[#22d3ee]'
                                                    : kpi.color === 'green'
                                                        ? 'text-green-500'
                                                        : 'text-[#f87171]'
                                                    }`}
                                            >
                                                {kpi.value}
                                            </p>
                                            {kpi.trend === 'up' && (
                                                <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className={`p-2 rounded-md ${kpi.color === 'cyan'
                                            ? 'bg-[#22d3ee]/10'
                                            : kpi.color === 'green'
                                                ? 'bg-green-500/10'
                                                : 'bg-[#f87171]/10'
                                            }`}
                                    >
                                        <Icon
                                            className={`w-5 h-5 ${kpi.color === 'cyan'
                                                ? 'text-[#22d3ee]'
                                                : kpi.color === 'green'
                                                    ? 'text-green-500'
                                                    : 'text-[#f87171]'
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Work Zone */}
            <div className="flex-1 flex gap-6 px-6 pb-6 overflow-hidden">
                {/* Verification Queue Table */}
                <div className="flex-1 overflow-hidden">
                    <div className="h-full bg-[#18181b] border border-[#27272a] rounded-lg flex flex-col">
                        {/* Header with Tabs */}
                        <div className="border-b border-[#27272a] px-6 py-4">
                            <h2 className="text-lg font-semibold text-white mb-4">Verification Queue</h2>
                            <div className="flex gap-1">
                                {(['pending', 'approved', 'rejected'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 text-sm rounded-md transition-all capitalize ${activeTab === tab
                                            ? 'bg-[#27272a] text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-[#27272a]/50'
                                            }`}
                                    >
                                        {tab}
                                        {tab === 'pending' && (
                                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-500 rounded">
                                                {verifications.filter((v) => v.status === 'pending').length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-[#18181b] border-b border-[#27272a]">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                                            Student
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                                            Skill Claim
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                                            Task ID
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                                            Proof
                                        </th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                                            Submitted
                                        </th>
                                        <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272a]">
                                    {filteredData.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-[#27272a]/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#0ea5e9] flex items-center justify-center text-xs font-medium">
                                                        {item.student.avatar}
                                                    </div>
                                                    <span className="text-sm text-white">{item.student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-white">{item.taskName}</span>
                                                    {item.marketDemand === 'high' && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 rounded">
                                                            High Demand
                                                        </span>
                                                    )}
                                                    {item.marketDemand === 'medium' && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded">
                                                            Medium Demand
                                                        </span>
                                                    )}
                                                    {item.marketDemand === 'low' && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-400/10 text-gray-400 border border-gray-400/20 rounded">
                                                            Low Demand
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs text-slate-400 font-mono bg-[#27272a] px-2 py-1 rounded">
                                                    {item.id}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <a
                                                    href={item.proofUrl}
                                                    className="inline-flex items-center gap-1 text-sm text-[#22d3ee] hover:underline"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    View
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                {item.submittedTime}
                                            </td>
                                            <td className="px-6 py-4">
                                                {activeTab === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApprove(item.id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22d3ee] text-black text-sm font-medium rounded-md hover:bg-[#22d3ee]/90 transition-all"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(item.id)}
                                                            className="inline-flex items-center justify-center w-8 h-8 text-[#f87171] hover:bg-[#f87171]/10 rounded-md transition-all"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end">
                                                        <span
                                                            className={`px-2 py-1 text-xs font-medium rounded-full ${activeTab === 'approved'
                                                                ? 'bg-[#22d3ee]/10 text-[#22d3ee]'
                                                                : 'bg-[#f87171]/10 text-[#f87171]'
                                                                }`}
                                                        >
                                                            {activeTab === 'approved' ? 'Verified' : 'Rejected'}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredData.length === 0 && (
                                <div className="flex items-center justify-center h-64 text-slate-400">
                                    No {activeTab} verifications
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side Panel - Activity Feed */}
                <div className="w-80 overflow-hidden">
                    <div className="h-full bg-[#18181b] border border-[#27272a] rounded-lg flex flex-col">
                        {/* Header */}
                        <div className="border-b border-[#27272a] px-5 py-4">
                            <h3 className="text-sm font-semibold text-white">Batch Activity</h3>
                            <p className="text-xs text-slate-400 mt-1">Recent student activity</p>
                        </div>

                        {/* Activity List */}
                        <div className="flex-1 overflow-auto p-4 space-y-3">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex gap-3 p-3 rounded-md hover:bg-[#27272a]/30 transition-colors"
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {activity.type === 'completed' ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-yellow-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">
                                            <span className="font-medium text-white">{activity.studentName}</span>
                                            <span className="text-slate-400">
                                                {' '}
                                                {activity.type === 'completed' ? 'finished' : 'submitted'}
                                            </span>
                                        </p>
                                        <p className="text-sm text-slate-400 mt-0.5 truncate">
                                            "{activity.taskName}"
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{activity.timeAgo}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
