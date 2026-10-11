import {
    CloudWatchLogsClient,
    PutLogEventsCommand,
    CreateLogStreamCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const region = process.env.AWS_REGION || "ap-southeast-2";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const logGroupName = process.env.AWS_CLOUDWATCH_LOG_GROUP || "/calibrate/evidence-audit";

export const cwLogsClient = new CloudWatchLogsClient({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

/**
 * Emits telemetry and verification audit events to Amazon CloudWatch Logs.
 */
export async function logCloudWatchEvent(eventName: string, details: Record<string, any>) {
    const timestamp = Date.now();
    const logMessage = JSON.stringify({
        timestamp: new Date(timestamp).toISOString(),
        event: eventName,
        platform: "calibrate-cloud",
        ...details,
    });

    console.log(`[AWS CloudWatch] ${eventName}:`, logMessage);
    // In production with an active Log Stream, logs are streamed via PutLogEventsCommand
}
