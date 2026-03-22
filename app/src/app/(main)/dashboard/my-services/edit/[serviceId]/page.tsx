// src/app/dashboard/my-services/edit/[serviceId]/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";

export default function EditServicePage() {
  const supabase = createClient();
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams();
  const serviceId = params.serviceId as string;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: service, error: fetchError } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (fetchError || !service) {
        setError("Service not found or you don't have permission to edit it.");
        setLoading(false);
        return;
      }

      if (service.user_id !== user.id) {
        setError("You are not authorized to edit this service.");
        setLoading(false);
        return;
      }

      setTitle(service.title);
      setDescription(service.description || "");
      setPrice(service.price.toString());
      setCurrentImageUrl(service.image_url);
      setImagePreview(service.image_url);
      setLoading(false);
    };

    fetchService();
  }, [serviceId, router, supabase, user]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setNewImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeImage = () => {
    setNewImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
    // Reset the file input
    const fileInput = document.getElementById(
      "service-image"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
    setError(null);
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    let updatedImageUrl = currentImageUrl;

    if (!user) {
      router.push("/login");
      return;
    }

    // --- NEW UPDATE LOGIC ---
    if (newImageFile) {
      try {
        const formData = new FormData();
        formData.append("file", newImageFile);

        // 1. Upload the NEW image
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        
        // 2. If successful, delete the OLD image to save space
        if (updatedImageUrl) {
          await fetch("/api/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: updatedImageUrl }),
          });
        }

        // 3. Set the new URL
        updatedImageUrl = data.url;

      } catch (err: unknown) {
        console.error("Image update failed:", err);
        setError("Error uploading new image: " + (err instanceof Error ? err.message : String(err)));
        setIsSubmitting(false);
        return;
      }
    }
    // --- END NEW UPDATE LOGIC ---

    const { error: updateError } = await supabase
      .from("services")
      .update({
        title,
        description,
        price: parseFloat(price),
        image_url: updatedImageUrl,
      })
      .eq("id", serviceId);

    if (updateError) {
      setError("Error updating service: " + updateError.message);
    } else {
      router.push("/dashboard/my-services");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);

    // --- NEW DELETE LOGIC ---
    // 1. Delete the image from MinIO first
    if (currentImageUrl) {
      try {
        await fetch("/api/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: currentImageUrl }),
        });
      } catch (err) {
        console.error("Error deleting image from storage:", err);
        // We proceed to delete the service even if the image delete fails
      }
    }
    // --- END NEW DELETE LOGIC ---

    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (deleteError) {
      setError("Error deleting service: " + deleteError.message);
      setIsSubmitting(false);
    } else {
      router.push("/dashboard/my-services");
    }
    setIsDeleteDialogOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete your service and its image."
      />
      <div>
        <Link
          href="/dashboard/my-services"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to My Services
        </Link>

        <h1 className="text-3xl font-bold">Edit Service</h1>
        <p className="text-muted-foreground mt-2">
          Update the details of your service below.
        </p>

        <form onSubmit={handleUpdate} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="service-image">Service Image (Max 5MB)</Label>
            <Input
              id="service-image"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
            />
            <p className="text-xs text-muted-foreground">
              Upload a new image to replace the current one (JPG, PNG, GIF - Max
              5MB)
            </p>
            {imagePreview && (
              <div className="mt-4 relative w-72 h-40 rounded-md overflow-hidden border">
                <Image
                  src={imagePreview}
                  alt="Service image preview"
                  fill
                  className="object-cover"
                  unoptimized
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>

        <Separator className="my-8" />
        <div className="p-6 border border-destructive/50 rounded-lg bg-destructive/5">
          <h3 className="text-lg font-semibold text-destructive">
            Delete Service
          </h3>
          <p className="text-sm text-destructive/80 mt-2">
            Once you delete this service, it cannot be recovered. Please be
            certain.
          </p>
          <Button
            variant="destructive"
            className="mt-4"
            onClick={() => setIsDeleteDialogOpen(true)}
            type="button"
          >
            Delete this service
          </Button>
        </div>
      </div>
    </>
  );
}