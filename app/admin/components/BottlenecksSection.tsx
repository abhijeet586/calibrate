"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Users } from "lucide-react";
import { reassignTrackTasks, assignTasksToMentor } from "@/lib/actions/reassign";
import type { TrackBottleneck, MentorWorkload } from "@/lib/actions/bottlenecks";

interface BottlenecksSectionProps {
    bottlenecks: TrackBottleneck[];
    mentors: MentorWorkload[];
}

export function BottlenecksSection({ bottlenecks, mentors }: BottlenecksSectionProps) {
    const [isPending, startTransition] = useTransition();
    const [selectedTrackForModal, setSelectedTrackForModal] = useState<string | null>(null);
    const [assigningMentorId, setAssigningMentorId] = useState<string | null>(null);

    function handleReassign(trackId: string) {
        startTransition(async () => {
            const result = await reassignTrackTasks(trackId);
            if (!result.success) {
                console.error("Reassignment failed:", result.message);
            }
        });
    }

    function handleAssignToMentor(mentorId: string) {
        if (!selectedTrackForModal) return;
        setAssigningMentorId(mentorId);
        startTransition(async () => {
            const result = await assignTasksToMentor(selectedTrackForModal, mentorId);
            if (!result.success) {
                console.error("Assignment failed:", result.message);
            }
            setAssigningMentorId(null);
            setSelectedTrackForModal(null);
        });
    }

    const selectedTrackName = bottlenecks.find(
        (t) => t.track_id === selectedTrackForModal
    )?.track_name;

    return (
        <>
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-white">Verification Bottlenecks</CardTitle>
                    <p className="text-sm text-zinc-500">Monitor track workload and pending requests</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {bottlenecks.length === 0 && (
                            <p className="text-sm text-zinc-500 text-center py-4">No tracks found.</p>
                        )}
                        {bottlenecks.map((track) => {
                            const isOverloaded = track.overloaded;
                            const progressValue = Math.min((track.pending_count / 50) * 100, 100);

                            return (
                                <div
                                    key={track.track_id}
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-white">{track.track_name}</h4>
                                            {isOverloaded && (
                                                <AlertTriangle className="size-4 text-red-500" />
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm font-semibold ${
                                                isOverloaded ? "text-red-500" : "text-cyan-500"
                                            }`}
                                        >
                                            {track.pending_count} Pending
                                        </span>
                                    </div>
                                    <Progress
                                        value={progressValue}
                                        className="mb-3 h-2 bg-zinc-800"
                                        indicatorClassName={
                                            isOverloaded ? "bg-red-500" : "bg-cyan-500"
                                        }
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isPending}
                                        onClick={
                                            isOverloaded
                                                ? () => handleReassign(track.track_id)
                                                : () => setSelectedTrackForModal(track.track_id)
                                        }
                                        className={`w-full border-zinc-800 text-xs shadow-none ${
                                            isOverloaded
                                                ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:text-red-400"
                                                : "bg-black/40 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                        }`}
                                    >
                                        {isPending && isOverloaded
                                            ? "Reassigning..."
                                            : isOverloaded
                                                ? "Reassign Tasks"
                                                : "View Details"}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Mentor Assignment Modal */}
            <Dialog
                open={selectedTrackForModal !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedTrackForModal(null);
                }}
            >
                <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Assign Mentor — {selectedTrackName}
                        </DialogTitle>
                        <p className="text-sm text-zinc-400 mt-1">
                            Select a mentor to assign all pending tasks for this track.
                        </p>
                    </DialogHeader>

                    <div className="mt-4 space-y-3 max-h-72 overflow-y-auto">
                        {mentors.length === 0 && (
                            <p className="text-sm text-zinc-500 text-center py-4">
                                No mentors available.
                            </p>
                        )}
                        {mentors.map((mentor) => (
                            <div
                                key={mentor.mentor_id}
                                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10">
                                        <Users className="size-4 text-cyan-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {mentor.full_name}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {mentor.active_count} active task{mentor.active_count !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    disabled={isPending}
                                    onClick={() => handleAssignToMentor(mentor.mentor_id)}
                                    className="bg-cyan-500 text-black hover:bg-cyan-400 text-xs"
                                >
                                    {isPending && assigningMentorId === mentor.mentor_id
                                        ? "Assigning..."
                                        : "Assign"}
                                </Button>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
