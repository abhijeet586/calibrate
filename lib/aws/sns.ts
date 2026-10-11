import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const region = process.env.APP_AWS_REGION || process.env.AWS_REGION || "ap-southeast-2";
const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";
const topicArn = process.env.APP_AWS_SNS_TOPIC_ARN || process.env.AWS_SNS_TOPIC_ARN || "";

export const snsClient = new SNSClient({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

/**
 * Publishes an alert to Amazon SNS when a student submits new evidence or when a verification event occurs.
 */
export async function publishVerificationNotification({
    studentName,
    taskTitle,
    s3Url,
}: {
    studentName: string;
    taskTitle: string;
    s3Url: string;
}) {
    if (!topicArn) {
        console.log("[AWS SNS] (Simulated) Notification dispatched:", {
            studentName,
            taskTitle,
            s3Url,
        });
        return { messageId: "simulated-sns-event-id" };
    }

    try {
        const command = new PublishCommand({
            TopicArn: topicArn,
            Subject: `[Calibrate] New Proof-of-Work Submission: ${studentName}`,
            Message: `Student ${studentName} has uploaded a proof deliverable for task: "${taskTitle}".\n\nS3 Evidence Artifact: ${s3Url}\n\nPlease review and verify in the Calibrate Mentor Portal.`,
        });

        const response = await snsClient.send(command);
        return { messageId: response.MessageId };
    } catch (error) {
        console.error("[AWS SNS Error]:", error);
        return null;
    }
}
