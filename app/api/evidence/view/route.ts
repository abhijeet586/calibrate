import { NextRequest, NextResponse } from "next/server";
import { generatePresignedDownloadUrl } from "@/lib/aws/s3";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    try {
        // If not an S3 URL from calibrate bucket, redirect directly (e.g. GitHub repo link)
        if (!url.includes("amazonaws.com") && !url.includes("calibrate-evidence-vault")) {
            return NextResponse.redirect(url, { status: 307 });
        }

        // Extract S3 object key
        let objectKey = "";
        try {
            const parsedUrl = new URL(url);
            let pathname = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
            const bucketName =
                process.env.APP_AWS_S3_BUCKET_NAME ||
                process.env.AWS_S3_BUCKET_NAME ||
                "calibrate-evidence-vault";

            if (pathname.startsWith(`${bucketName}/`)) {
                pathname = pathname.substring(bucketName.length + 1);
            }
            objectKey = pathname;
        } catch {
            objectKey = url;
        }

        if (!objectKey) {
            return NextResponse.json({ error: "Unable to parse S3 object key" }, { status: 400 });
        }

        const presignedUrl = await generatePresignedDownloadUrl(objectKey);
        return NextResponse.redirect(presignedUrl, { status: 307 });
    } catch (err: any) {
        console.error("Error generating presigned download URL:", err);
        return NextResponse.json(
            { error: "Failed to generate presigned download URL", details: err?.message },
            { status: 500 }
        );
    }
}
