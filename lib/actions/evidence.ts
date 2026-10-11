"use server";

import { createClient } from "@/lib/supabase/server";
import { generatePresignedUploadUrl, generatePresignedDownloadUrl } from "@/lib/aws/s3";
import { publishVerificationNotification } from "@/lib/aws/sns";
import { logCloudWatchEvent } from "@/lib/aws/cloudwatch";
import { revalidatePath } from "next/cache";

const bucketName = process.env.AWS_S3_BUCKET_NAME || "calibrate-evidence-vault";

export interface PresignedUrlResponse {
    uploadUrl: string;
    objectKey: string;
    s3Url: string;
}

/**
 * Generates an S3 presigned PUT URL for the authenticated student.
 */
export async function requestEvidenceUploadUrl(
    fileName: string,
    contentType: string
): Promise<PresignedUrlResponse> {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized to generate evidence upload URL");
    }

    const presigned = await generatePresignedUploadUrl(fileName, contentType, user.id);

    await logCloudWatchEvent("PRESIGNED_URL_GENERATED", {
        studentId: user.id,
        fileName,
        objectKey: presigned.objectKey,
    });

    return presigned;
}

/**
 * Registers an uploaded S3 evidence artifact into Calibrate's evidence_submissions
 * and updates the student roadmap task progress.
 */
export async function submitEvidenceRecord({
    title,
    description,
    skillCategory,
    githubUrl,
    s3Key,
    fileName,
    fileType,
    fileSizeBytes,
    roadmapItemId,
}: {
    title: string;
    description?: string;
    skillCategory?: string;
    githubUrl?: string;
    s3Key: string;
    fileName: string;
    fileType: string;
    fileSizeBytes: number;
    roadmapItemId?: string;
}) {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // 1. Record in evidence_submissions
    const { data: submission, error: subError } = await supabase
        .from("evidence_submissions")
        .insert({
            student_id: user.id,
            title,
            description: description || "",
            skill_category: skillCategory || "Cloud & Infrastructure",
            github_url: githubUrl || null,
            s3_key: s3Key,
            s3_bucket: bucketName,
            file_name: fileName,
            file_type: fileType,
            file_size_bytes: fileSizeBytes,
            status: "SUBMITTED",
        })
        .select()
        .single();

    if (subError) {
        console.error("Error creating evidence submission record:", subError);
        throw new Error(subError.message);
    }

    // 2. If tied to a roadmap milestone, record in student_progress
    if (roadmapItemId) {
        const s3PublicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "ap-southeast-2"}.amazonaws.com/${s3Key}`;
        await supabase.from("student_progress").insert({
            student_id: user.id,
            roadmap_item_id: roadmapItemId,
            proof_link: s3PublicUrl,
            status: "pending",
        });
    }

    // 3. Dispatch Amazon SNS Alert
    await publishVerificationNotification({
        studentName: user.email?.split("@")[0] || "Student",
        taskTitle: title,
        s3Url: `https://${bucketName}.s3.${process.env.AWS_REGION || "ap-southeast-2"}.amazonaws.com/${s3Key}`,
    });

    // 4. Log to CloudWatch
    await logCloudWatchEvent("EVIDENCE_SUBMITTED", {
        submissionId: submission.id,
        studentId: user.id,
        title,
        s3Key,
        fileSizeBytes,
    });

    revalidatePath("/student/roadmap");
    revalidatePath("/student/progress");
    revalidatePath("/mentor/verify");
    revalidatePath("/mentor");

    return submission;
}

/**
 * Gets a temporary presigned download URL for viewing or auditing private deliverables.
 */
export async function getEvidenceDownloadUrl(objectKey: string) {
    return await generatePresignedDownloadUrl(objectKey);
}
