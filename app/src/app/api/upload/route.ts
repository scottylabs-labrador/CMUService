import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({
  region: process.env.MINIO_REGION || "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT, // Uses the :9000 from env
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function POST(req: NextRequest) {
  console.log("--- Attempting Upload to:", process.env.MINIO_ENDPOINT, "---");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.MINIO_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    }));

    // Success!
    // For the public URL, we usually strip the port :9000 so it looks nice in the browser
    // (assuming the console URL can VIEW images even if it can't UPLOAD them)
    const publicBase = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL?.replace(':9000', '');
    const publicUrl = `${publicBase}/${fileName}`;
    
    return NextResponse.json({ url: publicUrl });

  } catch (error: unknown) {
    console.error("❌ Upload Error:", error); // Watch this log
    const err = error as { message?: string; code?: string };
    return NextResponse.json({ error: err.message, code: err.code }, { status: 500 });
  }
}