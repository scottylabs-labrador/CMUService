import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.MINIO_REGION || "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    // Extract the filename from the full URL
    // URL: https://bucket.../cmuservice-images/filename.png
    // We just want: filename.png
    const fileName = imageUrl.split('/').pop();

    if (!fileName) {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.MINIO_BUCKET_NAME,
      Key: fileName,
    }));

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}