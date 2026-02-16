import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Building2 } from "lucide-react";

interface FeedCardProps {
    title: string;
    tag: string;
    time: string;
    company: string;
}

export function FeedCard({ title, tag, time, company }: FeedCardProps) {
    return (
        <div className="rounded-lg border border-white/10 bg-zinc-900 p-6 transition-all hover:border-cyan-400/30">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                        <Building2 className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{company}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{time}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <h4 className="mb-4 text-lg font-medium text-white">{title}</h4>

            {/* Tags */}
            <div className="mb-4 flex gap-2">
                <Badge variant="secondary" className="bg-zinc-800 text-gray-300 hover:bg-zinc-700">
                    {tag}
                </Badge>
                <Badge variant="secondary" className="bg-zinc-800 text-gray-300 hover:bg-zinc-700">
                    React
                </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    size="sm"
                    className="bg-cyan-400 text-black hover:bg-cyan-500"
                >
                    Add to Roadmap
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-white/5"
                >
                    Read Docs →
                </Button>
            </div>
        </div>
    );
}
