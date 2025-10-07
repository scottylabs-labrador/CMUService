// src/app/dashboard/my-services/edit/[serviceId]/page.tsx

'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";

export default function EditServicePage() {
    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const serviceId = params.serviceId as string;

    // State for form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    // State for new image upload
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // General component state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Fetch existing service data when the component loads
    useEffect(() => {
        const fetchService = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: service, error: fetchError } = await supabase
                .from('services')
                .select('*')
                .eq('id', serviceId)
                .single();

            if (fetchError || !service) {
                setError("Service not found or you don't have permission to edit it.");
                setLoading(false);
                return;
            }

            // Security check: ensure the user owns this service
            if (service.user_id !== user.id) {
                 setError("You are not authorized to edit this service.");
                 setLoading(false);
                 return;
            }

            // 2. Populate the form with the fetched data
            setTitle(service.title);
            setDescription(service.description || "");
            setPrice(service.price.toString());
            setCurrentImageUrl(service.image_url);
            setImagePreview(service.image_url); // Set initial preview to current image

            setLoading(false);
        };

        fetchService();
    }, [serviceId, router, supabase]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // 3. Handle the UPDATE logic on form submission
    const handleUpdate = async (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        let updatedImageUrl = currentImageUrl;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        // If a new image was uploaded, handle the storage operations
        if (newImageFile) {
            const filePath = `${user.id}/${Date.now()}_${newImageFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('service-images')
                .upload(filePath, newImageFile);

            if (uploadError) {
                setError("Error uploading new image: " + uploadError.message);
                setIsSubmitting(false);
                return;
            }
            
            const { data: { publicUrl } } = supabase.storage.from('service-images').getPublicUrl(filePath);
            updatedImageUrl = publicUrl;
        }

        // 4. Perform the update in the 'services' table
        const { error: updateError } = await supabase
            .from('services')
            .update({
                title,
                description,
                price: parseFloat(price),
                image_url: updatedImageUrl,
            })
            .eq('id', serviceId);

        if (updateError) {
            setError("Error updating service: " + updateError.message);
        } else {
            router.push('/dashboard/my-services');
        }
        setIsSubmitting(false);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div>
            <Link href="/dashboard/my-services" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to My Services
            </Link>

            <h1 className="text-3xl font-bold">Edit Service</h1>
            <p className="text-muted-foreground mt-2">Update the details of your service below.</p>

            <form onSubmit={handleUpdate} className="mt-8 space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="service-image">Service Image</Label>
                    <Input id="service-image" type="file" onChange={handleFileChange} accept="image/*" />
                    {imagePreview && (
                        <div className="mt-4 relative w-72 h-40 rounded-md overflow-hidden">
                            <Image src={imagePreview} alt="Service image preview" fill className="object-cover" />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="title">Service Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Starting Price ($)</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </form>
        </div>
    );
}