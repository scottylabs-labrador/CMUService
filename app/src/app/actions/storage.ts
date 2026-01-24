// src/app/actions/storage.ts
'use server'

import { minioClient } from "@/lib/minio";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

export async function getPresignedUploadUrl(fileType: string) {
  console.log("--- [SERVER ACTION] Starting Upload Request ---");
  
  const fileExtension = fileType.split('/')[1] || 'jpg';
  const fileName = `${uuidv4()}.${fileExtension}`;
  const bucketName = process.env.MINIO_BUCKET_NAME || "cmuservice-images";

  console.log(`📂 Bucket: ${bucketName}`);
  console.log(`📄 Generated Filename: ${fileName}`);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    ContentType: fileType,
  });

  try {
    const signedUrl = await getSignedUrl(minioClient, command, { expiresIn: 300 });
    
    // Debugging the URL construction
    const envBaseUrl = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
    console.log(`🔗 ENV Base URL: ${envBaseUrl}`);

    // Construct the final URL
    const publicUrl = `${envBaseUrl}/${fileName}`;
    console.log(`✅ Final Public URL: ${publicUrl}`);
    
    return { success: true, signedUrl, publicUrl, fileName };

  } catch (error: any) {
    console.error("❌ [SERVER ERROR] S3 Signing Failed:", error);
    return { success: false, error: error.message };
  }
}