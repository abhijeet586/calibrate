"use client";

import { useState } from "react";
import { createTargetRole, deleteTargetRole } from "@/lib/actions/admin";
import { AdminTargetRole } from "@/lib/actions/admin";
import { Plus, Loader2, AlertCircle, Sparkles, Trash2 } from "lucide-react";

interface AdminTracksClientProps {
    initialRoles: AdminTargetRole[];
}

export default function AdminTracksClient({ initialRoles }: AdminTracksClientProps) {
    const [roles] = useState(initialRoles);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure? This will delete all associated roadmap tasks and student progress for the track "${name}".`)) {
            return;
        }

        setDeletingId(id);
        setError(null);
        setSuccess(null);

        try {
            await deleteTargetRole(id);
            setSuccess(`Track "${name}" deleted successfully!`);
            window.location.reload();
        } catch (err: any) {
            setError(err.message || "Failed to delete track");
        } finally {
            setDeletingId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData(e.currentTarget);

        // Validate JSON before sending
        const skillsRaw = formData.get("required_skills") as string;
        try {
            JSON.parse(skillsRaw);
        } catch {
            setError('Invalid JSON format. Example: {"Python": 100, "TensorFlow": 80}');
            setIsSubmitting(false);
            return;
        }

        try {
            await createTargetRole(formData);
            setSuccess(`Track "${formData.get("name")}" created successfully!`);
            (e.target as HTMLFormElement).reset();
            window.location.reload();
        } catch (err: any) {
            setError(err.message || "Failed to create track");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-10">
            {/* Create Form */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                        <Plus className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Create Career Track</h2>
                        <p className="text-xs text-zinc-500">Define a new role with required skills and market demand</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                                Track Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                placeholder="e.g., AI Engineer"
                                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                                Market Demand Score <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="market_demand_score"
                                type="number"
                                min="1"
                                max="100"
                                required
                                placeholder="e.g., 95"
                                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                            Required Skills (JSON) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="required_skills"
                            required
                            rows={3}
                            placeholder='{"Python": 100, "TensorFlow": 80, "System Design": 70}'
                            className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono resize-none"
                        />
                        <p className="text-[10px] text-zinc-600 mt-1">Format: {`{"SkillName": proficiencyRequired, ...}`}</p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-emerald-400">{success}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto px-6 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                Create Track
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Existing Tracks Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Active Career Tracks</h2>
                    <span className="px-3 py-1 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                        {roles.length} Track{roles.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {roles.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500">
                        <p className="text-sm">No career tracks created yet. Use the form above to add one.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900/50 border-b border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wide">Track</th>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wide">Demand</th>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wide">Required Skills</th>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wide">Created</th>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {roles.map(role => (
                                    <tr key={role.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-white">{role.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${role.market_demand_score >= 80 ? 'bg-emerald-500' :
                                                        role.market_demand_score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`} />
                                                <span className="text-sm text-zinc-300">{role.market_demand_score}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5 max-w-sm">
                                                {Object.entries(role.required_skills || {}).map(([skill, level]) => (
                                                    <span
                                                        key={skill}
                                                        className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 rounded"
                                                    >
                                                        {skill}: {String(level)}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500 whitespace-nowrap">
                                            {new Date(role.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(role.id, role.name)}
                                                disabled={deletingId === role.id}
                                                className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                                                title="Delete Track"
                                            >
                                                {deletingId === role.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
