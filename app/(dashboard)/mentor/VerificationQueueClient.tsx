"use client";

import { useState } from "react";
import { Check, X, ExternalLink, Inbox, Loader2, AlertCircle, Map, Target } from "lucide-react";
import { resolveVerification, resolveRoadmapTask } from "@/lib/actions/mentor";
import { useRouter } from "next/navigation";
import { QueueItem } from "./page";

interface VerificationQueueClientProps {
    initialQueue: QueueItem[];
}

export default function VerificationQueueClient({ initialQueue }: VerificationQueueClientProps) {
    const router = useRouter();
    const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Modal state for rejection
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
    const [rejectComment, setRejectComment] = useState("");

    const handleApprove = async (item: QueueItem) => {
        setIsSubmitting(item.id);
        setError(null);
        try {
            if (item.type === 'skill') {
                await resolveVerification(item.id, 'approved', 'Great job! Proof verified.');
            } else {
                await resolveRoadmapTask(item.id, 'verified', 'Task verified successfully.');
            }

            // Optimistically update UI
            setQueue(prev => prev.filter(v => v.id !== item.id));
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to approve verification");
            console.error(err);
        } finally {
            setIsSubmitting(null);
        }
    };

    const openRejectModal = (item: QueueItem) => {
        setSelectedItem(item);
        setRejectComment("");
        setError(null);
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedItem) return;

        if (!rejectComment.trim()) {
            setError("Feedback is mandatory for rejections.");
            return;
        }

        setIsSubmitting(selectedItem.id);
        try {
            if (selectedItem.type === 'skill') {
                await resolveVerification(selectedItem.id, 'rejected', rejectComment);
            } else {
                await resolveRoadmapTask(selectedItem.id, 'rejected', rejectComment);
            }

            // Optimistically update UI
            setQueue(prev => prev.filter(v => v.id !== selectedItem.id));
            setRejectModalOpen(false);
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to reject verification");
        } finally {
            setIsSubmitting(null);
        }
    };

    return (
        <div className="flex-1 overflow-hidden">
            <div className="h-full bg-[#18181b] border border-[#27272a] rounded-lg flex flex-col relative">
                {/* Header */}
                <div className="border-b border-[#27272a] px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Verification Queue</h2>
                    <span className="px-3 py-1 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                        {queue.length} Pending
                    </span>
                </div>

                {error && !rejectModalOpen && (
                    <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    {queue.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-[#27272a]/50 flex items-center justify-center mb-2">
                                <Inbox className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white">You're all caught up!</h3>
                            <p className="text-sm">No pending verifications at this time.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-[#18181b] border-b border-[#27272a] z-10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wide w-1/4">
                                        Student
                                    </th>
                                    <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wide w-1/3">
                                        Task / Claim
                                    </th>
                                    <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wide w-1/6">
                                        Proof
                                    </th>
                                    <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wide text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272a]">
                                {queue.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-[#27272a]/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                                                    {item.student.name.substring(0, 2) || "ST"}
                                                </div>
                                                <span className="text-sm font-medium text-white max-w-[150px] truncate" title={item.student.name}>
                                                    {item.student.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    {item.type === 'roadmap' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                                                            <Map className="w-3 h-3" />
                                                            Roadmap
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                                                            <Target className="w-3 h-3" />
                                                            Skill Claim
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm text-zinc-200 font-medium line-clamp-2" title={item.taskName}>
                                                    {item.taskName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <a
                                                href={item.proofUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                View Proof
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(item)}
                                                    disabled={isSubmitting === item.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 text-sm font-medium rounded-md hover:bg-cyan-500/20 border border-cyan-500/20 transition-all disabled:opacity-50"
                                                >
                                                    {isSubmitting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(item)}
                                                    disabled={isSubmitting === item.id}
                                                    className="inline-flex items-center justify-center px-3 py-1.5 bg-red-500/10 text-red-400 text-sm font-medium rounded-md hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50"
                                                >
                                                    <X className="w-4 h-4 mr-1.5" />
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Rejection Modal */}
                {rejectModalOpen && selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-[#121212] border border-red-500/30 rounded-xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {/* Decorative top border */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />

                            <h3 className="text-lg font-bold text-white mb-2">Reject Submission</h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                Please provide constructive feedback for <span className="text-zinc-200 font-semibold">{selectedItem.student.name}</span> on their
                                {selectedItem.type === 'skill' ? ' skill claim' : ' roadmap task'}.
                            </p>

                            <form onSubmit={handleRejectSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                                        Mentor Feedback <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={rejectComment}
                                        onChange={(e) => {
                                            setRejectComment(e.target.value);
                                            setError(null);
                                        }}
                                        rows={4}
                                        placeholder="e.g., The GitHub repository is currently set to private. Please make it public and resubmit."
                                        className="w-full bg-black/50 border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-red-400">{error}</p>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setRejectModalOpen(false)}
                                        disabled={isSubmitting === selectedItem.id}
                                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting === selectedItem.id || !rejectComment.trim()}
                                        className="px-5 py-2 bg-red-500 text-white hover:bg-red-600 font-medium rounded-lg shadow-[0_0_12px_-2px_rgba(239,68,68,0.4)] transition-all flex items-center disabled:opacity-50"
                                    >
                                        {isSubmitting === selectedItem.id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Rejecting...
                                            </>
                                        ) : (
                                            "Confirm Rejection"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
