"use client";

import { useState, useTransition } from "react";
import {
    Search,
    Filter,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronDown,
    Loader2,
    Cloud,
} from "lucide-react";
import { approveSubmission, rejectSubmission } from "@/lib/actions/mentor";
import type { VerifySubmission } from "@/lib/actions/mentor";

interface VerifySkillsClientProps {
    submissions: VerifySubmission[];
    tracks: string[];
    skills: string[];
}

export default function VerifySkillsClient({
    submissions,
    tracks,
    skills,
}: VerifySkillsClientProps) {
    const [selectedSubmission, setSelectedSubmission] = useState<VerifySubmission | null>(
        submissions[0] ?? null
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTrack, setSelectedTrack] = useState("All Tracks");
    const [selectedSkill, setSelectedSkill] = useState("All Skills");
    const [activeTab, setActiveTab] = useState("pending");
    const [feedback, setFeedback] = useState("");

    const [isPending, startTransition] = useTransition();
    const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

    // Filter submissions based on search and filters
    const filteredSubmissions = submissions.filter((submission) => {
        const matchesSearch = submission.studentName
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesTrack =
            selectedTrack === "All Tracks" || submission.track === selectedTrack;
        const matchesSkill =
            selectedSkill === "All Skills" || submission.skill === selectedSkill;
        return matchesSearch && matchesTrack && matchesSkill;
    });

    const handleApprove = () => {
        if (!selectedSubmission) return;
        setActionType("approve");
        startTransition(async () => {
            try {
                await approveSubmission(
                    selectedSubmission.id,
                    selectedSubmission.studentId,
                    selectedSubmission.skillId
                );
                setFeedback("");
                setSelectedSubmission(null);
            } catch (err: any) {
                console.error("Approve failed:", err);
                alert(`Error approving: ${err.message}`);
            } finally {
                setActionType(null);
            }
        });
    };

    const handleReject = () => {
        if (!selectedSubmission) return;
        if (
            !window.confirm(
                `Are you sure you want to reject this task for ${selectedSubmission.studentName}?`
            )
        ) {
            return;
        }
        setActionType("reject");
        startTransition(async () => {
            try {
                await rejectSubmission(
                    selectedSubmission.id,
                    feedback || undefined
                );
                setFeedback("");
                setSelectedSubmission(null);
            } catch (err: any) {
                console.error("Reject failed:", err);
                alert(`Error rejecting: ${err.message}`);
            } finally {
                setActionType(null);
            }
        });
    };

    const isApproving = isPending && actionType === "approve";
    const isRejecting = isPending && actionType === "reject";

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
            <div className="max-w-[1800px] mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-zinc-50 mb-2">
                        Skill Verification Workspace
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Review and validate student submissions in detail. Provide
                        feedback and approve or reject skill demonstrations.
                    </p>
                </div>

                {/* Controls Bar */}
                <div className="mb-6 space-y-4">
                    {/* Search and Filters */}
                    <div className="flex flex-wrap gap-4">
                        {/* Search Input */}
                        <div className="flex-1 min-w-[280px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by student name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all"
                                />
                            </div>
                        </div>

                        {/* Filter by Track */}
                        <div className="relative min-w-[200px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none z-10" />
                            <select
                                value={selectedTrack}
                                onChange={(e) => setSelectedTrack(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-50 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all"
                            >
                                {tracks.map((track) => (
                                    <option key={track} value={track}>
                                        {track}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
                        </div>

                        {/* Filter by Skill */}
                        <div className="relative min-w-[200px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none z-10" />
                            <select
                                value={selectedSkill}
                                onChange={(e) => setSelectedSkill(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-50 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all"
                            >
                                {skills.map((skill) => (
                                    <option key={skill} value={skill}>
                                        {skill}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="inline-flex bg-zinc-900/50 border border-zinc-800 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                                activeTab === "pending"
                                    ? "bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-400/25"
                                    : "text-zinc-400 hover:text-zinc-50"
                            }`}
                        >
                            Pending Queue
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                                activeTab === "history"
                                    ? "bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-400/25"
                                    : "text-zinc-400 hover:text-zinc-50"
                            }`}
                        >
                            Verification History
                        </button>
                    </div>
                </div>

                {/* Split-Screen Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[calc(100vh-340px)]">
                    {/* Left Column - Submission List */}
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 h-full">
                            <h2 className="text-lg font-semibold text-zinc-50 mb-4 px-2">
                                Submissions ({filteredSubmissions.length})
                            </h2>
                            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-440px)] pr-2">
                                {filteredSubmissions.length > 0 ? (
                                    filteredSubmissions.map((submission) => (
                                        <button
                                            key={submission.id}
                                            onClick={() =>
                                                setSelectedSubmission(submission)
                                            }
                                            className={`w-full text-left p-4 rounded-lg transition-all ${
                                                selectedSubmission?.id === submission.id
                                                    ? "bg-zinc-800/80 border-2 border-cyan-400 shadow-lg shadow-cyan-400/10"
                                                    : "bg-zinc-800/40 border border-zinc-700 hover:bg-zinc-800/60 hover:border-zinc-600"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Avatar */}
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center font-bold text-zinc-950 flex-shrink-0">
                                                    {submission.studentInitials}
                                                </div>
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-zinc-50 mb-1 truncate">
                                                        {submission.studentName}
                                                    </h3>
                                                    <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
                                                        {submission.taskTitle}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>
                                                            {submission.submittedTime}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-zinc-500">
                                        No submissions found matching your filters
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Review Panel */}
                    <div className="lg:col-span-3">
                        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 h-full">
                            {selectedSubmission ? (
                                <div className="h-full flex flex-col">
                                    {/* Student and Task Header */}
                                    <div className="mb-6 pb-6 border-b border-zinc-800">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center font-bold text-xl text-zinc-950">
                                                {selectedSubmission.studentInitials}
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-zinc-50 mb-1">
                                                    {selectedSubmission.studentName}
                                                </h2>
                                                <p className="text-lg text-cyan-400 mb-2">
                                                    {selectedSubmission.taskTitle}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-300">
                                                        {selectedSubmission.track}
                                                    </span>
                                                    <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-cyan-400">
                                                        {selectedSubmission.skill}
                                                    </span>
                                                    <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-400 flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3" />
                                                        {selectedSubmission.submittedTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scrollable Content Area */}
                                    <div className="flex-1 overflow-y-auto space-y-6 mb-6">
                                        {/* Task Instructions */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                                                Task Instructions
                                            </h3>
                                            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                                                <p className="text-zinc-300 leading-relaxed">
                                                    {selectedSubmission.instructions}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Proof URL */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                                                    Submission Proof
                                                </h3>
                                                {selectedSubmission.proofUrl && (selectedSubmission.proofUrl.includes("amazonaws.com") || selectedSubmission.proofUrl.includes("calibrate-evidence-vault")) && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400/10 border border-amber-400/30 text-amber-400">
                                                        <Cloud className="w-3.5 h-3.5" />
                                                        AWS S3 Verified Artifact
                                                    </span>
                                                )}
                                            </div>
                                            {selectedSubmission.proofUrl ? (
                                                <a
                                                    href={`/api/evidence/view?url=${encodeURIComponent(selectedSubmission.proofUrl)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-cyan-400/10 to-teal-500/10 border border-cyan-400/30 rounded-lg text-cyan-400 hover:border-cyan-400 hover:bg-cyan-400/20 transition-all group"
                                                >
                                                    <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
                                                    <div className="flex flex-col text-left min-w-0">
                                                        <span className="font-semibold text-cyan-300">
                                                            {selectedSubmission.proofUrl.includes("amazonaws.com")
                                                                ? "Open AWS S3 Deliverable (Signed Viewer)"
                                                                : "Open Submission Proof"}
                                                        </span>
                                                        <span className="text-xs text-zinc-400 font-mono break-all mt-0.5">
                                                            {selectedSubmission.proofUrl}
                                                        </span>
                                                    </div>
                                                </a>
                                            ) : (
                                                <p className="text-zinc-500 italic">
                                                    No proof link submitted.
                                                </p>
                                            )}
                                        </div>

                                        {/* Mentor Feedback */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                                                Mentor Feedback (Optional)
                                            </h3>
                                            <textarea
                                                value={feedback}
                                                onChange={(e) =>
                                                    setFeedback(e.target.value)
                                                }
                                                placeholder="Provide constructive feedback for the student..."
                                                rows={5}
                                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 pt-6 border-t border-zinc-800">
                                        <button
                                            onClick={handleApprove}
                                            disabled={isPending}
                                            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold rounded-lg transition-all shadow-lg shadow-cyan-400/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {isApproving ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Approving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span>Approve Task</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={isPending}
                                            className="flex items-center justify-center gap-3 px-6 py-4 bg-transparent border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {isRejecting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Rejecting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-5 h-5" />
                                                    <span>Reject</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-zinc-500">
                                    Select a submission to review
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
