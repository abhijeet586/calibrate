"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { broadcastMarketUpdate } from "@/lib/actions/admin";

export default function BroadcastFormClient() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        const formData = new FormData(e.currentTarget);

        try {
            await broadcastMarketUpdate(formData);
            setSuccessMessage("Broadcast sent successfully!");
            (e.target as HTMLFormElement).reset();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to send broadcast");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
                <CardTitle className="text-white">Broadcast New Alert</CardTitle>
                <p className="text-sm text-zinc-500">Send market updates to students</p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-zinc-300">
                            Alert Title
                        </Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            disabled={isSubmitting}
                            placeholder="e.g., Google Hiring Alert"
                            className="border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-zinc-300">
                            Message
                        </Label>
                        <Textarea
                            id="content"
                            name="content"
                            required
                            disabled={isSubmitting}
                            placeholder="Enter your market update or opportunity details..."
                            rows={4}
                            className="border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="priority" className="text-zinc-300">
                                Priority (Category)
                            </Label>
                            {/* We use 'category' name to match our DB schema and server action */}
                            <Select name="category" defaultValue="medium" disabled={isSubmitting}>
                                <SelectTrigger
                                    id="priority"
                                    className="border-zinc-700 bg-zinc-950 text-white"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="track" className="text-zinc-300">
                                Target Track (Optional tagging)
                            </Label>
                            <Select defaultValue="all" disabled={isSubmitting}>
                                <SelectTrigger
                                    id="track"
                                    className="border-zinc-700 bg-zinc-950 text-white"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Tracks</SelectItem>
                                    <SelectItem value="fullstack">Full Stack</SelectItem>
                                    <SelectItem value="aiml">AI & ML</SelectItem>
                                    <SelectItem value="devops">DevOps</SelectItem>
                                    <SelectItem value="mobile">Mobile Dev</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <p className="text-sm text-emerald-500">{successMessage}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 size-4" />
                                Send Broadcast
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
