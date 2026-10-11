import { NextRequest, NextResponse } from "next/server";
import { s3Client } from "@/lib/aws/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

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

        const bucketName =
            process.env.APP_AWS_S3_BUCKET_NAME ||
            process.env.AWS_S3_BUCKET_NAME ||
            "calibrate-evidence-vault";

        const s3Response = await s3Client.send(
            new GetObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
            })
        );

        if (!s3Response.Body) {
            return NextResponse.json({ error: "Empty artifact response from S3" }, { status: 404 });
        }

        // Convert AWS SDK stream to Web ReadableStream
        const stream = s3Response.Body.transformToWebStream();
        const contentType = s3Response.ContentType || "application/pdf";
        const fileName = objectKey.split("/").pop() || "evidence-artifact";

        const headers = new Headers();
        headers.set("Content-Type", contentType);
        if (s3Response.ContentLength) {
            headers.set("Content-Length", s3Response.ContentLength.toString());
        }
        // inline display allows browser to preview PDF and images directly
        headers.set("Content-Disposition", `inline; filename="${fileName}"`);
        headers.set("Cache-Control", "private, max-age=3600");

        return new NextResponse(stream as any, {
            status: 200,
            headers,
        });
    } catch (err: any) {
        console.error("Error streaming S3 artifact:", err);
        return NextResponse.json(
            { error: "Failed to load artifact from S3 Evidence Vault", details: err?.message },
            { status: 500 }
        );
    }
}
