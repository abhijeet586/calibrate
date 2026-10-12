"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Bell, Cloud, ShieldCheck } from "lucide-react";
import { TelemetryEvent } from "@/lib/aws/cloudwatch";

export function TelemetrySection({ events }: { events: TelemetryEvent[] }) {
    return (
        <Card className="border-zinc-800 bg-zinc-900 overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b border-zinc-800/80">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="size-5 text-cyan-400" />
                        <CardTitle className="text-white text-lg">
                            AWS Cloud Telemetry & Observability
                        </CardTitle>
                    </div>
                    <p className="text-xs text-zinc-400">
                        Live audit stream from Amazon CloudWatch Logs and Amazon SNS Pub/Sub dispatches
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs py-1">
                        <Cloud className="w-3 h-3 mr-1" />
                        LogGroup: /calibrate/evidence-audit
                    </Badge>
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs py-1">
                        <Bell className="w-3 h-3 mr-1" />
                        SNS: calibrate-mentor-alerts
                    </Badge>
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs py-1">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        ap-southeast-2 (Live)
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4 p-0">
                {events.length === 0 ? (
                    <div className="py-8 text-center text-zinc-500 text-sm">
                        No telemetry events recorded yet. Upload a deliverable as student to generate events.
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-800/60 max-h-[360px] overflow-y-auto font-mono text-xs">
                        {events.map((evt) => {
                            const isSNS = evt.service === "Amazon SNS";
                            return (
                                <div
                                    key={evt.id}
                                    className="p-4 hover:bg-zinc-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    isSNS
                                                        ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                                                        : "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                                                }`}
                                            >
                                                {evt.event}
                                            </span>
                                            <span className="text-zinc-500 text-[11px]">
                                                via {evt.service}
                                            </span>
                                        </div>
                                        <div className="text-zinc-300 truncate">
                                            {isSNS
                                                ? evt.details.subject
                                                : `Artifact: ${evt.details.fileName} (${(
                                                      evt.details.fileSizeBytes / 1024
                                                  ).toFixed(1)} KB) -> ${evt.details.s3Key}`}
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-zinc-500 text-[11px] md:text-right">
                                        {new Date(evt.timestamp).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        })}{" "}
                                        · {new Date(evt.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
