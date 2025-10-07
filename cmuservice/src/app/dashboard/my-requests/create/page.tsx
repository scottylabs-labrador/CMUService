// app/dashboard/my-requests/create/page.tsx

'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client"; // 1. Use the new client-side client

export default function CreateRequestPage() {
    const supabase = createClient(); // 2. Create the client instance
    const router = useRouter(); 

    const [title, setTitle] = useState("");
    const [budget, setBudget] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault(); 
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("You must be logged in to create a request.");
            return;
        }
        
        if (!title || !budget) {
            setError("Title and Budget are required.");
            return;
        }

        const { error: insertError } = await supabase.from('requests').insert({
            title: title,
            budget: parseFloat(budget),
            user_id: user.id 
        });

        if (insertError) {
            setError(insertError.message); 
            console.error("Error inserting data:", insertError);
        } else {
            router.push("/dashboard/my-requests");
        }
    };

    return (
        <div>
            <Link
                href="/dashboard/my-requests"
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8"
            >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to My Requests
            </Link>

            <h1 className="text-3xl font-bold">Create a New Request</h1>
            <p className="text-muted-foreground mt-2">
                Fill out the form below to post a new job request.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Request Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g., Need a photographer for graduation photos"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input
                        id="budget"
                        type="number"
                        placeholder="e.g., 100"
                        min="0"
                        step="0.01"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="text-red-600">{error}</p>}

                <Button type="submit">Post Request</Button>
            </form>
        </div>
    );
}