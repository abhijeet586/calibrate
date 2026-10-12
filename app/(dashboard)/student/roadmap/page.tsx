import React from 'react';
import Link from 'next/link';
import RoadmapClient from './RoadmapClient';
import { getStudentRoadmap } from '@/lib/actions/roadmap';
import { getUserId } from '@/lib/actions/userId';
import { getStudentCurrentRole, getAllRolesForStudent } from '@/lib/actions/student';
import { Target, Lightbulb, Compass, ArrowRight } from 'lucide-react';

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
    let studentId: string | undefined;
    let currentRoleId: string | null = null;
    let roles: any[] = [];
    let items: any[] = [];
    let trackName = "Calibrate Cloud";

    try {
        studentId = await getUserId();
        if (studentId) {
            currentRoleId = await getStudentCurrentRole();
            roles = await getAllRolesForStudent();
            const activeTrack = roles.find(r => r.id === currentRoleId);
            if (activeTrack) {
                trackName = activeTrack.name;
            }
            items = await getStudentRoadmap(studentId, currentRoleId);
        }
    } catch (err) {
        console.error("Error loading roadmap data:", err);
    }

    if (!studentId) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
                    <p className="text-zinc-400">Please sign in to view your roadmap.</p>
                </div>
            </div>
        );
    }

    // 4A. Student hasn't selected a career track yet
    if (!currentRoleId) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white py-10 px-4 md:px-8 font-sans">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">My Roadmap</h1>
                                <p className="text-sm text-zinc-400 max-w-lg">
                                    Personalized Cloud Engineering Curriculum
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="border border-zinc-800/60 bg-[#121212]/70 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto relative overflow-hidden shadow-2xl">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

                        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                            <Compass className="w-8 h-8 text-cyan-400" />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Select Your Career Track</h3>

                        <p className="text-zinc-400 text-sm max-w-md leading-relaxed mb-8">
                            You haven't chosen a specialization track yet. Select from our available industry tracks (Cloud Solutions Architect, DevOps & Platform Engineer, or Full-Stack Cloud Engineer) to unlock your verified proof-of-work milestones.
                        </p>

                        <Link
                            href="/student/roles"
                            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2 text-sm group"
                        >
                            <span>Explore Career Tracks</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 4B. Handle Empty State when role selected but no items configured
    if (!items || items.length === 0) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white py-10 px-4 md:px-8 font-sans">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">My Roadmap</h1>
                                <p className="text-sm text-zinc-400 max-w-lg">
                                    Calibrate Cloud {trackName} Curriculum
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="border border-zinc-800/50 bg-[#121212]/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto relative overflow-hidden">
                        {/* Decorative background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

                        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                            <Target className="w-8 h-8 text-cyan-500/80" />
                        </div>

                        <h3 className="text-xl font-bold text-zinc-200 mb-3 tracking-tight">No Roadmap Assigned Yet</h3>

                        <p className="text-zinc-500 text-sm max-w-md leading-relaxed mb-8">
                            No roadmap tasks have been assigned for this track yet.
                        </p>

                        <div className="flex items-center gap-3 text-xs font-medium text-amber-500/80 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                            <Lightbulb className="w-4 h-4" />
                            <span>Check back soon or contact your mentor.</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 5. Pass Data to Client Component
    return (
        <React.Fragment>
            <RoadmapClient items={items} />
        </React.Fragment>
    );
}
