"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

// Note: No longer importing getPresignedUploadUrl since we use the API route now

export default function CreateServicePage() {
  const supabase = createClient();
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceImage, setServiceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setServiceImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeImage = () => {
    setServiceImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById("service-image") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!user) {
      setError("You must be logged in to create a service.");
      setIsSubmitting(false);
      return;
    }

    let imageUrl = null;

    // --- NEW PROXY UPLOAD LOGIC ---
    if (serviceImage) {
      try {
        const formData = new FormData();
        formData.append("file", serviceImage);

        // 1. Send file to YOUR Next.js API route (which proxies to MinIO)
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        // 2. Get the MinIO URL back from your server
        const data = await response.json();
        imageUrl = data.url;
        
      } catch (err: unknown) {
        console.error("Upload failed:", err);
        setError("Failed to upload image. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }
    // --- END NEW LOGIC ---

    const { error: insertError } = await supabase.from("services").insert({
      title: title,
      description: description,
      price: parseFloat(price),
      user_id: user.id,
      image_url: imageUrl, // This now saves the MinIO URL
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      router.push("/dashboard/my-services");
    }

    setIsSubmitting(false);
  };

  return (
    <div>
      <Link
        href="/dashboard/my-services"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to My Services
      </Link>

      <h1 className="text-3xl font-bold">Create a New Service</h1>
      <p className="text-muted-foreground mt-2">
        Fill out the form below to list a new service you are offering.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="service-image">Service Image (Max 5MB)</Label>
          <Input
            id="service-image"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
          />
          <p className="text-xs text-muted-foreground">
            Upload an image to represent your service (JPG, PNG, GIF - Max 5MB)
          </p>
          {imagePreview && (
            <div className="mt-4 relative w-72 h-40 rounded-md overflow-hidden border">
              <Image
                src={imagePreview}
                alt="Image preview"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 w-8 h-8 p-0 rounded-full"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Service Title</Label>
          <Input
            id="title"
            placeholder="e.g., I will proofread your essay"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your service in detail..."
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= 5000) {
                setDescription(e.target.value);
              }
            }}
            maxLength={5000}
            rows={6}
          />
          <p className="text-xs text-muted-foreground text-right">
            {description.length}/5000 characters
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Starting Price ($)</Label>
          <Input
            id="price"
            type="number"
            placeholder="e.g., 25"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Service..." : "Create Service"}
        </Button>
      </form>
    </div>
  );
}