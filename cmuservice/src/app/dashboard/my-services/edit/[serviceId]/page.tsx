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
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Separator } from "@/components/ui/separator";

export default function EditServicePage() {
    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const serviceId = params.serviceId as string;

    // State for the confirmation dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // State for form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // General component state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
    }, [serviceId, router, supabase]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
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

    const handleDelete = async () => {
        setIsSubmitting(true);
        
        if (currentImageUrl) {
            const fileName = currentImageUrl.split('/').pop();
            const { data: { user } } = await supabase.auth.getUser();
            if (fileName && user) {
                 const { error: storageError } = await supabase.storage
                    .from('service-images')
                    .remove([`${user.id}/${fileName}`]);

                if (storageError) {
                    console.error("Error deleting image from storage:", storageError.message);
                }
            }
        }

        const { error: deleteError } = await supabase
            .from('services')
            .delete()
            .eq('id', serviceId);

        if (deleteError) {
            setError("Error deleting service: " + deleteError.message);
            setIsSubmitting(false);
        } else {
            router.push('/dashboard/my-services');
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
                    
                    {error && <p className="text-red-600">{error}</p>}

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>

                <Separator className="my-8" />
                <div className="p-6 border border-destructive/50 rounded-lg bg-destructive/5">
                     <h3 className="text-lg font-semibold text-destructive">Delete Service</h3>
                     <p className="text-sm text-destructive/80 mt-2">
                        Once you delete this service, it cannot be recovered. Please be certain.
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