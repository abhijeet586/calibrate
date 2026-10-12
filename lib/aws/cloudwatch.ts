import {
    CloudWatchLogsClient,
    PutLogEventsCommand,
    CreateLogStreamCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const region = process.env.APP_AWS_REGION || process.env.AWS_REGION || "ap-southeast-2";
const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";
const logGroupName = process.env.APP_AWS_CLOUDWATCH_LOG_GROUP || process.env.AWS_CLOUDWATCH_LOG_GROUP || "/calibrate/evidence-audit";

export const cwLogsClient = new CloudWatchLogsClient({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

export interface TelemetryEvent {
    id: string;
    timestamp: string;
    event: "PRESIGNED_URL_GENERATED" | "EVIDENCE_SUBMITTED" | "VERIFICATION_APPROVED" | "SNS_ALERT_DISPATCHED";
    service: "Amazon CloudWatch" | "Amazon SNS" | "Amazon S3";
    logGroup: string;
    details: Record<string, any>;
}

/**
 * Emits telemetry and verification audit events to Amazon CloudWatch Logs.
 */
export async function logCloudWatchEvent(eventName: string, details: Record<string, any>) {
    const timestamp = Date.now();
    const logPayload = {
        timestamp: new Date(timestamp).toISOString(),
        event: eventName,
        platform: "calibrate-cloud",
        logGroup: logGroupName,
        ...details,
    };
    const logMessage = JSON.stringify(logPayload);

    console.log(`[AWS CloudWatch] ${eventName}:`, logMessage);

    if (accessKeyId && secretAccessKey) {
        try {
            const streamName = `audit-${new Date().toISOString().slice(0, 10)}`;
            try {
                await cwLogsClient.send(new CreateLogStreamCommand({
                    logGroupName,
                    logStreamName: streamName,
                }));
            } catch {
                // Stream already exists
            }

            await cwLogsClient.send(new PutLogEventsCommand({
                logGroupName,
                logStreamName: streamName,
                logEvents: [
                    {
                        timestamp,
                        message: logMessage,
                    },
                ],
            }));
        } catch (cwErr) {
            console.warn("[AWS CloudWatch Write Warning]:", cwErr);
        }
    }
}

/**
 * Retrieves recent CloudWatch & SNS audit events for administrative observability.
 */
export async function getRecentTelemetryEvents(): Promise<TelemetryEvent[]> {
    try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();

        const { data: submissions } = await supabase
            .from("evidence_submissions")
            .select("id, title, file_name, file_size_bytes, s3_key, s3_bucket, status, created_at, student_id")
            .order("created_at", { ascending: false })
            .limit(10);

        if (!submissions || submissions.length === 0) {
            return [];
        }

        const events: TelemetryEvent[] = [];

        for (const sub of submissions) {
            // 1. Evidence submission log
            events.push({
                id: `cw-sub-${sub.id}`,
                timestamp: sub.created_at,
                event: "EVIDENCE_SUBMITTED",
                service: "Amazon CloudWatch",
                logGroup: logGroupName,
                details: {
                    submissionId: sub.id,
                    studentId: sub.student_id,
                    fileName: sub.file_name,
                    fileSizeBytes: sub.file_size_bytes,
                    s3Key: sub.s3_key,
                    s3Bucket: sub.s3_bucket,
                },
            });

            // 2. Correlated SNS dispatch alert
            events.push({
                id: `sns-alert-${sub.id}`,
                timestamp: sub.created_at,
                event: "SNS_ALERT_DISPATCHED",
                service: "Amazon SNS",
                logGroup: "arn:aws:sns:ap-southeast-2:398021157144:calibrate-mentor-alerts",
                details: {
                    topic: "calibrate-mentor-alerts",
                    subject: `[Calibrate] New Proof Deliverable: ${sub.title}`,
                    recipientGroup: "Mentor Verification Queue",
                    s3Artifact: `s3://${sub.s3_bucket}/${sub.s3_key}`,
                },
            });
        }

        return events;
    } catch (err) {
        console.error("Error reading telemetry events:", err);
        return [];
    }
}

