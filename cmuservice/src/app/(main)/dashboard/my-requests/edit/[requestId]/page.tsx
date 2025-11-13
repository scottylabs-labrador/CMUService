// src/app/dashboard/my-requests/edit/[requestId]/page.tsx

'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Separator } from "@/components/ui/separator";

export default function EditRequestPage() {
    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const requestId = params.requestId as string;

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchRequest = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: request, error: fetchError } = await supabase
                .from('requests')
                .select('*')
                .eq('id', requestId)
                .single();

            if (fetchError || !request) {
                setError("Request not found or you don't have permission to edit it.");
                setLoading(false);
                return;
            }

            if (request.user_id !== user.id) {
                 setError("You are not authorized to edit this request.");
                 setLoading(false);
                 return;
            }

            setTitle(request.title);
            setDescription(request.description || "");
            setBudget(request.budget.toString());
            setLoading(false);
        };

        fetchRequest();
    }, [requestId, router, supabase]);
    
    const handleUpdate = async (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const { error: updateError } = await supabase
            .from('requests')
            .update({
                title,
                description,
                budget: parseFloat(budget),
            })
            .eq('id', requestId);

        if (updateError) {
            setError("Error updating request: " + updateError.message);
        } else {
            router.push('/dashboard/my-requests');
        }
        setIsSubmitting(false);
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        const { error: deleteError } = await supabase
            .from('requests')
            .delete()
            .eq('id', requestId);

        if (deleteError) {
            setError("Error deleting request: " + deleteError.message);
            setIsSubmitting(false);
        } else {
            router.push('/dashboard/my-requests');
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
                description="This action cannot be undone. This will permanently delete your request."
            />
            <div>
                <Link href="/dashboard/my-requests" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to My Requests
                </Link>

                <h1 className="text-3xl font-bold">Edit Request</h1>
                <p className="text-muted-foreground mt-2">Update the details of your request below.</p>

                <form onSubmit={handleUpdate} className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Request Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="budget">Budget ($)</Label>
                        <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                    </div>
                    
                    {error && <p className="text-red-600">{error}</p>}
                    
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>

                <Separator className="my-8" />
                <div className="p-6 border border-destructive/50 rounded-lg bg-destructive/5">
                     <h3 className="text-lg font-semibold text-destructive">Delete Request</h3>
                     <p className="text-sm text-destructive/80 mt-2">
                        Once you delete this request, it cannot be recovered.
                     </p>
                     <Button 
                        variant="destructive" 
                        className="mt-4"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        type="button"
                     >
                        Delete this request
                    </Button>
                </div>
            </div>
        </>
    );
}