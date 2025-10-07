// app/dashboard/my-services/create/page.tsx

'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react";
import { createClient } from "@/utils/supabase/client"; // 1. Change the import
import Image from "next/image";

export default function CreateServicePage() {
    const supabase = createClient(); // 2. Create the client instance
    const router = useRouter();

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
            setServiceImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("You must be logged in to create a service.");
            setIsSubmitting(false);
            return;
        }

        let imageUrl = null;

        if (serviceImage) {
            const filePath = `${user.id}/${Date.now()}_${serviceImage.name}`;
            
            const { error: uploadError } = await supabase.storage
                .from('service-images')
                .upload(filePath, serviceImage);

            if (uploadError) {
                setError("Error uploading image: " + uploadError.message);
                setIsSubmitting(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('service-images')
                .getPublicUrl(filePath);
            
            imageUrl = publicUrl;
        }

        const { error: insertError } = await supabase.from('services').insert({
            title: title,
            description: description,
            price: parseFloat(price),
            user_id: user.id,
            image_url: imageUrl,
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
                    <Label htmlFor="service-image">Service Image</Label>
                    <Input id="service-image" type="file" onChange={handleFileChange} accept="image/*" />
                    {imagePreview && (
                        <div className="mt-4 relative w-72 h-40 rounded-md overflow-hidden">
                            <Image src={imagePreview} alt="Image preview" fill className="object-cover" />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="title">Service Title</Label>
                    <Input id="title" placeholder="e.g., I will proofread your essay" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe your service in detail..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Starting Price ($)</Label>
                    <Input id="price" type="number" placeholder="e.g., 25" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>

                {error && <p className="text-red-600">{error}</p>}
                
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Service...' : 'Create Service'}
                </Button>
            </form>
        </div>
    );
}