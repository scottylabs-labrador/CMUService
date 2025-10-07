// app/dashboard/my-services/create/page.tsx

'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient"; // Import the Supabase client

export default function CreateServicePage() {
    const router = useRouter(); // To redirect the user after success

    // Use state to hold the value of each form input
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [error, setError] = useState<string | null>(null);

    // This function will run when the user submits the form
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault(); // Prevent the browser from reloading the page
        setError(null); // Clear any previous errors

        // 1. Get the current logged-in user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("You must be logged in to create a service.");
            return;
        }
        
        if (!title || !price) {
            setError("Title and Price are required.");
            return;
        }

        // 2. Insert the data into the 'services' table
        const { error: insertError } = await supabase.from('services').insert({
            title: title,
            description: description,
            price: parseFloat(price),
            user_id: user.id // Associate the service with the logged-in user
        });

        if (insertError) {
            setError(insertError.message); // Show an error if the insert fails
            console.error("Error inserting data:", insertError);
        } else {
            // 3. If successful, redirect the user back to their services page
            router.push("/dashboard/my-services");
        }
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

            {/* Attach the handleSubmit function to the form's onSubmit event */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Service Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g., I will proofread your essay"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} // Update title state
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Describe your service in detail..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)} // Update description state
                    />
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
                        onChange={(e) => setPrice(e.target.value)} // Update price state
                    />
                </div>

                {/* Display an error message if something goes wrong */}
                {error && <p className="text-red-600">{error}</p>}

                <Button type="submit">Create Service</Button>
            </form>
        </div>
    );
}