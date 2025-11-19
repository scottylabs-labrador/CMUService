// src/app/actions/storage.ts
'use server'

import { minioClient } from "@/lib/minio";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

export async function getPresignedUploadUrl(fileType: string) {
  const fileExtension = fileType.split('/')[1] || 'jpg';
  const fileName = `${uuidv4()}.${fileExtension}`;

  // Debugging: Print exactly what we are trying to do
  console.log("--- ATTEMPTING UPLOAD ---");
  console.log("Endpoint:", process.env.MINIO_ENDPOINT);
  console.log("Bucket:", process.env.MINIO_BUCKET_NAME);
  console.log("Region:", process.env.MINIO_REGION);
  console.log("File:", fileName);

  const command = new PutObjectCommand({
    Bucket: process.env.MINIO_BUCKET_NAME || "cmuservice-images", // Fallback
    Key: fileName,
    ContentType: fileType,
    // REMOVE 'ACL' if it was there. MinIO policies often conflict with ACLs.
  });

  try {
    const signedUrl = await getSignedUrl(minioClient, command, { expiresIn: 300 });
    
    // If successful, print the URL (shortened)
    console.log("Success! Signed URL generated.");
    
    const publicUrl = `${process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL}/${fileName}`;
    return { success: true, signedUrl, publicUrl, fileName };

  } catch (error: any) {
    // --- THIS IS THE CRITICAL PART ---
    console.error("❌ MINIO ERROR DETAILS ❌");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Code:", error.code); // Useful for AWS SDK errors
    console.error("Stack:", error.stack);
    return { success: false, error: error.message };
  }
}