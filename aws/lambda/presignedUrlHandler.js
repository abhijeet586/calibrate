/**
 * Calibrate Cloud — AWS Lambda Presigned URL Generator
 * Microservice invoked via Amazon API Gateway to issue cryptographic S3 upload tickets.
 */

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const region = process.env.AWS_REGION || "ap-southeast-2";
const bucketName = process.env.AWS_S3_BUCKET_NAME || "calibrate-evidence-vault";

const s3Client = new S3Client({ region });

exports.handler = async (event) => {
    try {
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body || {};
        const { fileName, contentType, studentId } = body;

        if (!fileName || !contentType || !studentId) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: "Missing required parameters: fileName, contentType, studentId" }),
            };
        }

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
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
            body: JSON.stringify({
                uploadUrl,
                objectKey,
                s3Url: `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`,
            }),
        };
    } catch (error) {
        console.error("Lambda execution error:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
