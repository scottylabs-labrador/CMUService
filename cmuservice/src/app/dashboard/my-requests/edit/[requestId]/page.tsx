// src/app/dashboard/my-requests/edit/[requestId]/page.tsx

'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";

export default function EditRequestPage() {
    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const requestId = params.requestId as string;

    // State for form fields
    const [title, setTitle] = useState("");
    const [budget, setBudget] = useState("");

    // General component state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch existing request data when the component loads
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

            // Security check: ensure the user owns this request
            if (request.user_id !== user.id) {
                 setError("You are not authorized to edit this request.");
                 setLoading(false);
                 return;
            }

            // Populate the form with the fetched data
            setTitle(request.title);
            setBudget(request.budget.toString());
            setLoading(false);
        };

        fetchRequest();
    }, [requestId, router, supabase]);
    
    // Handle the UPDATE logic on form submission
    const handleUpdate = async (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const { error: updateError } = await supabase
            .from('requests')
            .update({
                title,
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
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
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                </div>
                
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </form>
        </div>
    );
}