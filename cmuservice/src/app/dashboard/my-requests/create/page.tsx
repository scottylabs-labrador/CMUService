'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CreateRequestPage() {
    const [budget, setBudget] = useState("");

    const handleBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;

        // This regex checks if the number has more than two decimal places
        if (value.match(/\.\d{3,}/)) {
            // If it does, it truncates it to two decimal places
            value = parseFloat(value).toFixed(2);
        }

        setBudget(value);
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

            <form className="mt-8 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Request Title</Label>
                    <Input id="title" placeholder="e.g., Need a photographer for graduation photos" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input
                        id="budget"
                        type="number"
                        placeholder="e.g., 100"
                        min="0"
                        step="0.01"
                        onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
                        value={budget}
                        onChange={handleBudgetChange}
                    />
                </div>
                <Button type="submit">Post Request</Button>
            </form>
        </div>
    );
}

