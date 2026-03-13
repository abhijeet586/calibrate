"use client";

import { useState, useEffect } from "react";
import { AdminTargetRole, AdminCurriculumItem, getAdminCurriculumItems, createRoadmapItem } from "@/lib/actions/admin";
import { BookOpen, Link as LinkIcon, Plus, Target, CheckCircle2, Loader2, Sparkles, AlertCircle, ChevronDown } from "lucide-react";

import { useRouter } from "next/navigation";

interface Props {
    tracks: AdminTargetRole[];
    skills: { id: string; name: string }[];
}

export default function AdminCurriculumClient({ tracks, skills }: Props) {
    const router = useRouter();
    const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || "");
    const [items, setItems] = useState<AdminCurriculumItem[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);

    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch items when track changes
    useEffect(() => {
        if (!selectedTrackId) return;

        const fetchItems = async () => {
            setIsLoadingItems(true);
            try {
                const data = await getAdminCurriculumItems(selectedTrackId);
                setItems(data);
            } catch (err) {
                console.error("Failed to load items", err);
            } finally {
                setIsLoadingItems(false);
            }
        };

        fetchItems();
    }, [selectedTrackId]);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);
        try {
            const newItem = await createRoadmapItem(formData);

            // Immediately append to local state
            setItems((prev) => [...prev, newItem]);

            // Force Next.js router to refresh and reflect new changes in background
            router.refresh();

            // Reset form
            (document.getElementById("add-task-form") as HTMLFormElement).reset();
        } catch (err: any) {
            setError(err.message || "Failed to create task");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (tracks.length === 0) {
        return (
            <div className="p-10 border border-zinc-800 rounded-2xl bg-zinc-900/50 text-center">
                <Target className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No Career Tracks Found</h3>
                <p className="text-zinc-500 mt-2">You must create at least one career track before building a curriculum.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Selection & Form */}
            <div className="lg:col-span-5 space-y-8">

                {/* Track Selector */}
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                        Active Career Track
                    </label>
                    <div className="relative w-full">
                        <select
                            value={selectedTrackId}
                            onChange={(e) => setSelectedTrackId(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pr-10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 appearance-none transition-all cursor-pointer shadow-sm hover:border-zinc-700"
                        >
                            {tracks.map(t => (
                                <option key={t.id} value={t.id} className="bg-zinc-900 text-white py-2">{t.name}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Add Task Form */}
                <form id="add-task-form" action={handleSubmit} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-4">
                        <Plus className="w-5 h-5 text-cyan-500" />
                        Add Roadmap Task
                    </h2>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <input type="hidden" name="target_role_id" value={selectedTrackId} />

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase">Task Instruction</label>
                        <textarea
                            name="task_instruction"
                            required
                            placeholder="e.g., Build a REST API using Express and connect it to MongoDB..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-700 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase">Resource URL (Optional)</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="url"
                                name="resource_link"
                                placeholder="https://..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase">Target Skill to Validate</label>
                        <input
                            type="text"
                            name="skill_name"
                            required
                            placeholder="e.g., React, TypeScript, System Design"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-sm"
                        />
                        <p className="text-[10px] text-zinc-500">When a mentor approves this task, the student will automatically be granted 100% proficiency in this skill. New skills will be created automatically.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Adding Task...</>
                        ) : (
                            <><Sparkles className="w-4 h-4" /> Save Task directly to Roadmap</>
                        )}
                    </button>
                </form>

            </div>

            {/* Right Column: Existing Items Table/List */}
            <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cyan-500" />
                        Curriculum Tasks ({items.length})
                    </h2>
                </div>

                {isLoadingItems ? (
                    <div className="p-12 border border-zinc-800 rounded-2xl bg-zinc-900/30 flex flex-col items-center justify-center text-zinc-500">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500/50 mb-4" />
                        <p>Loading roadmap items...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-12 border border-zinc-800 border-dashed rounded-2xl bg-zinc-900/20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Empty Curriculum</h3>
                        <p className="text-zinc-500 text-sm max-w-sm">
                            There are no roadmap items for this track yet. Use the form to add the first required task.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={item.id} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold items-center justify-center border border-cyan-500/20">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm leading-relaxed font-medium mb-3">
                                            {item.task_instruction}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-3">
                                            {item.market_skills?.name && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                    Validates: {item.market_skills.name}
                                                </span>
                                            )}

                                            {item.resource_link && (
                                                <a
                                                    href={item.resource_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-300 transition-colors border border-blue-500/20"
                                                >
                                                    <LinkIcon className="w-3 h-3" />
                                                    Resource Link
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
