import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.APP_AWS_REGION || process.env.AWS_REGION || "ap-southeast-2";
const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";
const bucketName = process.env.APP_AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || "calibrate-evidence-vault";

export const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

/**
 * Generates an Amazon S3 presigned PUT URL for secure, direct-to-S3 student uploads.
 * URL is valid for 15 minutes (900 seconds).
 */
export async function generatePresignedUploadUrl(
    fileName: string,
    contentType: string,
    studentId: string
) {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectKey = `evidence/${studentId}/${Date.now()}-${cleanFileName}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: contentType,
        Metadata: {
            "uploaded-by": studentId,
            "platform": "calibrate-cloud",
        },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return {
        uploadUrl,
        objectKey,
        s3Url: `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`,
    };
}

/**
 * Generates an Amazon S3 presigned GET URL for mentors to inspect private student deliverables.
 */
export async function generatePresignedDownloadUrl(objectKey: string) {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
