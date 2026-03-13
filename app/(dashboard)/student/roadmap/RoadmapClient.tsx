"use client";

import React, { useState } from 'react';
import { CheckCircle2, Lock, AlertCircle, ArrowRight, RefreshCcw, PlayCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoadmapItem } from '@/lib/actions/roadmap';
import { submitRoadmapProof } from '@/lib/actions/roadmap';

// --- Types ---
type SkillStatus = 'todo' | 'actionable' | 'pending' | 'rejected' | 'verified';

interface SkillCardProps {
    title: string;
    status: SkillStatus;
    description?: string;
    mentorFeedback?: string;
    onAction?: () => void;
    isSubmitting?: boolean;
}

// --- Status Mapping ---
// DB progress statuses: 'pending' -> maps to UI 'actionable'
// DB progress statuses: 'completed' -> maps to UI 'pending' (pending mentor review)
// DB progress statuses: 'verified' -> maps to UI 'verified'
// We will treat items with NO student_progress record as 'todo' or 'actionable' based on logic in the parent component.
function mapDBStatusToUI(
    progressRecord?: { status: string; proof_link: string | null; mentor_feedback: string | null },
    isActionable: boolean = false
): SkillStatus {
    if (!progressRecord) {
        return isActionable ? 'actionable' : 'todo';
    }

    if (progressRecord.status === 'completed') {
        return 'pending'; // UI status for "Under Review"
    }

    if (progressRecord.status === 'verified') {
        return 'verified';
    }

    if (progressRecord.status === 'rejected') {
        return 'rejected';
    }

    // If progress exists but is 'pending' in DB, or any other state
    return isActionable ? 'actionable' : 'todo';
}

// --- SkillCard Component ---
const SkillCard: React.FC<SkillCardProps> = ({
    title,
    status,
    description,
    mentorFeedback,
    onAction,
    isSubmitting
}) => {
    const config = {
        todo: {
            wrapper: "border-zinc-800 bg-zinc-900/30 opacity-40 grayscale-[0.2]",
            title: "text-zinc-500",
            badge: null,
            icon: null,
            button: "bg-zinc-800/40 text-zinc-500 border border-zinc-800/50 rounded-lg hover:bg-zinc-800/60 hover:text-zinc-300",
            buttonIcon: <PlayCircle className="w-4 h-4 ml-2 opacity-50" />,
            buttonText: "Start",
            disabled: false,
        },
        actionable: {
            wrapper: "border-zinc-800 bg-[#121212] hover:border-cyan-500/50 transition-colors",
            title: "text-zinc-100",
            badge: null,
            icon: null,
            button: "bg-cyan-500 text-black hover:bg-cyan-400 font-semibold rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]",
            buttonIcon: <ArrowRight className="w-4 h-4 ml-2" />,
            buttonText: "Submit Claim",
            disabled: false,
        },
        pending: {
            wrapper: "border-[#b45309]/30 bg-[#121212]",
            title: "text-zinc-100",
            badge: { text: "PENDING MENTOR REVIEW", classes: "text-[#d97706] border border-[#d97706]/30 bg-[#d97706]/10" },
            icon: null,
            button: "bg-cyan-500 text-black hover:bg-cyan-400 font-semibold rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]",
            buttonIcon: <ArrowRight className="w-4 h-4 ml-2" />,
            buttonText: "Submit Claim",
            disabled: false,
        },
        rejected: {
            wrapper: "border-red-500/30 bg-[#121212]",
            title: "text-zinc-100",
            badge: { text: "NEEDS REVISION", classes: "text-red-400 border border-red-500/30 bg-red-500/10" },
            icon: null,
            button: "bg-red-500 text-white hover:bg-red-600 font-medium rounded-lg shadow-[0_0_12px_-2px_rgba(239,68,68,0.4)]",
            buttonIcon: <RefreshCcw className="w-4 h-4 ml-2" />,
            buttonText: "Resubmit Proof",
            disabled: false,
        },
        verified: {
            wrapper: "border-cyan-500/30 bg-[#121212]",
            title: "text-zinc-100",
            badge: { text: "VERIFIED", classes: "text-cyan-400 border border-cyan-500/30 bg-cyan-500/10" },
            icon: <CheckCircle2 className="w-5 h-5 text-cyan-500" />,
            button: "hidden",
            buttonIcon: null,
            buttonText: "",
            disabled: true,
        }
    }[status];

    return (
        <div className={cn("relative rounded-xl border p-6 flex flex-col h-full", config.wrapper)}>
            <div className="flex items-start justify-between mb-4">
                <h3 className={cn("text-lg font-semibold", config.title)}>
                    {title}
                </h3>
                {config.icon}
            </div>

            {config.badge && (
                <div className="mb-4 flex">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold tracking-wider", config.badge.classes)}>
                        {config.badge.text}
                    </span>
                </div>
            )}

            {description && (
                <p className="text-sm text-zinc-400 mb-6 flex-grow leading-relaxed">
                    {description}
                </p>
            )}

            {status === 'rejected' && mentorFeedback && (
                <div className="mb-6 p-4 rounded-lg bg-black border border-zinc-800 flex gap-3 items-start">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <span className="text-zinc-200 block mb-1 font-semibold text-xs tracking-wide uppercase">Mentor Feedback</span>
                        <span className="text-sm text-zinc-400">{mentorFeedback}</span>
                    </div>
                </div>
            )}

            {status !== 'verified' && (
                <div className="mt-auto">
                    <button
                        disabled={config.disabled || isSubmitting}
                        onClick={onAction}
                        className={cn(
                            "w-full flex items-center justify-center px-4 py-3 text-sm transition-all relative overflow-hidden",
                            config.button,
                            (config.disabled || isSubmitting) && "opacity-80"
                        )}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </div>
                        ) : (
                            <>
                                {config.buttonText}
                                {config.buttonIcon}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Main Client Component ---
export default function RoadmapClient({ items }: { items: RoadmapItem[] }) {
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);
    const [proofUrl, setProofUrl] = useState("");
    const [error, setError] = useState("");

    // Group items by Roadmap ID (which acts as our "Phases" here)
    const phases = items.reduce((acc, item) => {
        const title = item.roadmaps?.title || 'General Curriculum';
        if (!acc[title]) {
            acc[title] = [];
        }
        acc[title].push(item);
        return acc;
    }, {} as Record<string, RoadmapItem[]>);

    const phaseTitles = Object.keys(phases);

    // Calculate progress based on verified items vs total
    const totalItems = items.length;
    const verifiedItems = items.filter(i =>
        i.student_progress && i.student_progress.length > 0 &&
        i.student_progress[0].status === 'verified'
    ).length;
    const progressPercentage = totalItems > 0 ? Math.round((verifiedItems / totalItems) * 100) : 0;

    const handleActionClick = (item: RoadmapItem) => {
        setSelectedItem(item);
        setProofUrl("");
        setError("");
        setModalOpen(true);
    };

    const handleSubmitProof = async (e: React.FormEvent) => {
        e.preventDefault();

        // Debugging to ensure the button is registering the click
        alert("Calling Server Action...");

        if (!proofUrl || !proofUrl.startsWith('http')) {
            setError("Please provide a valid URL starting with http:// or https://");
            return;
        }

        if (!selectedItem) return;

        setSubmittingId(selectedItem.id);

        try {
            await submitRoadmapProof(selectedItem.id, proofUrl);
            setModalOpen(false);
        } catch (err: any) {
            setError(err.message || "Failed to submit proof. Please try again.");
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white py-10 px-4 md:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header & Progress */}
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">My Roadmap</h1>
                            <p className="text-sm text-zinc-400 max-w-lg">
                                Track your progress through the MarketReady curriculum. Complete tasks by submitting skill claims to be verified by a Mentor.
                            </p>
                        </div>
                        <div className="text-sm font-semibold tracking-widest text-zinc-400 uppercase md:text-right">
                            Track Completion: <span className="text-cyan-400">{progressPercentage}%</span>
                        </div>
                    </div>

                    {/* Segmented Progress Bar */}
                    <div className="flex w-full h-1.5 gap-1 overflow-hidden rounded-full mb-8 bg-transparent">
                        {[1, 2, 3, 4].map((step, index) => {
                            // Rough approximation for 4 segments based on percentage
                            const threshold = (index + 1) * 25;
                            const isFilled = progressPercentage >= threshold ||
                                (progressPercentage > (index * 25) && progressPercentage < threshold && step === Math.ceil(progressPercentage / 25));

                            return (
                                <div
                                    key={step}
                                    className={`h-full flex-1 ${isFilled ? 'bg-cyan-500' : 'bg-zinc-800/80'}`}
                                />
                            );
                        })}
                    </div>
                </header>

                {/* Vertical Stepper / Timeline Layout */}
                <div className="relative mt-8">
                    {/* Continuous Connecting Line */}
                    <div className="absolute left-3 top-6 bottom-0 w-[2px] bg-zinc-700/80 z-0" />

                    <div className="space-y-16">
                        {phaseTitles.map((title, phaseIndex) => {
                            const phaseItems = phases[title];

                            // Determine if this phase is completely finished
                            const isPhaseVerified = phaseItems.every(i =>
                                i.student_progress && i.student_progress.length > 0 && i.student_progress[0].status === 'verified'
                            );

                            // A phase is "active" if the previous phase is completely verified, or if it's the first phase
                            const isPreviousPhaseVerified = phaseIndex === 0 ? true :
                                phases[phaseTitles[phaseIndex - 1]].every(i =>
                                    i.student_progress && i.student_progress.length > 0 && i.student_progress[0].status === 'verified'
                                );

                            return (
                                <div key={title} className="relative flex gap-6 md:gap-8 z-10">
                                    <div className="flex flex-col items-center mt-1 shrink-0">
                                        <div className={cn(
                                            "h-6 w-6 rounded-full bg-[#0A0A0A] border-[2px] flex items-center justify-center relative z-10",
                                            isPhaseVerified || isPreviousPhaseVerified
                                                ? "border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                                                : "border-zinc-700/80"
                                        )}>
                                            <div className={cn(
                                                "rounded-full",
                                                isPhaseVerified || isPreviousPhaseVerified
                                                    ? "h-2.5 w-2.5 bg-cyan-500"
                                                    : "h-2 w-2 bg-zinc-600/50"
                                            )} />
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                                            <p className="text-sm text-zinc-500 mt-1">Complete the items below to master this phase.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {phaseItems.map((item, itemIndex) => {
                                                // An item is actionable if it's the first unverified item in the phase,
                                                // or if all items before it are verified.
                                                const allPreviousVerified = phaseItems.slice(0, itemIndex).every(i =>
                                                    i.student_progress && i.student_progress.length > 0 && i.student_progress[0].status === 'verified'
                                                );

                                                const isActionable = isPreviousPhaseVerified && allPreviousVerified;
                                                const record = item.student_progress && item.student_progress.length > 0 ? item.student_progress[0] : undefined;
                                                const uiStatus = mapDBStatusToUI(record, isActionable);

                                                return (
                                                    <SkillCard
                                                        key={item.id}
                                                        title={item.task_instruction}
                                                        description={item.resource_link ? `Resource: ${item.resource_link}` : "Complete the assigned task to proceed."}
                                                        status={uiStatus}
                                                        mentorFeedback={record?.mentor_feedback || undefined}
                                                        onAction={() => handleActionClick(item)}
                                                        isSubmitting={submittingId === item.id}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Proof Submission Modal */}
            {modalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#121212] border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Decorative top border */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />

                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Submit Claim</h3>
                        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                            Provide a link to your proof of work for <span className="text-zinc-200 font-semibold">{selectedItem.task_instruction}</span>. This could be a GitHub PR, deployed URL, or document.
                        </p>

                        <form onSubmit={handleSubmitProof} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                                    Proof URL
                                </label>
                                <input
                                    type="url"
                                    value={proofUrl}
                                    onChange={(e) => {
                                        setProofUrl(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="https://github.com/..."
                                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                                    required
                                    disabled={submittingId === selectedItem.id}
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    disabled={submittingId === selectedItem.id}
                                    className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingId === selectedItem.id || !proofUrl}
                                    className="px-5 py-2 bg-cyan-500 text-black hover:bg-cyan-400 font-semibold rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingId === selectedItem.id ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Proof"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
