// app/dashboard/my-requests/create/page.tsx

'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient"; // Import the Supabase client

export default function CreateRequestPage() {
    const router = useRouter(); // To redirect the user after success

    // Use state to hold the value of each form input
    const [title, setTitle] = useState("");
    const [budget, setBudget] = useState("");
    const [error, setError] = useState<string | null>(null);

    // This function will run when the user submits the form
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault(); // Prevent the browser from reloading the page
        setError(null); // Clear any previous errors

        // 1. Get the current logged-in user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("You must be logged in to create a request.");
            return;
        }
        
        if (!title || !budget) {
            setError("Title and Budget are required.");
            return;
        }

        // 2. Insert the data into the 'requests' table
        const { error: insertError } = await supabase.from('requests').insert({
            title: title,
            budget: parseFloat(budget),
            user_id: user.id // Associate the request with the logged-in user
        });

        if (insertError) {
            setError(insertError.message); // Show an error if the insert fails
            console.error("Error inserting data:", insertError);
        } else {
            // 3. If successful, redirect the user back to their requests page
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

            {/* Attach the handleSubmit function to the form's onSubmit event */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Request Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g., Need a photographer for graduation photos"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} // Update title state
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
                        onChange={(e) => setBudget(e.target.value)} // Update budget state
                    />
                </div>

                {/* Display an error message if something goes wrong */}
                {error && <p className="text-red-600">{error}</p>}

                <Button type="submit">Post Request</Button>
            </form>
        </div>
    );
}