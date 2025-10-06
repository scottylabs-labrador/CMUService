'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CreateServicePage() {
    const [price, setPrice] = useState("");

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;

        // This regex checks if the number has more than two decimal places
        if (value.match(/\.\d{3,}/)) {
            // If it does, it truncates it to two decimal places
            value = parseFloat(value).toFixed(2);
        }

        setPrice(value);
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

            <form className="mt-8 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Service Title</Label>
                    <Input id="title" placeholder="e.g., I will proofread your essay" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe your service in detail..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Starting Price ($)</Label>
                    <Input
                        id="price"
                        type="number"
                        placeholder="e.g., 25"
                        min="0"
                        step="0.01"
                        onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
                        value={price}
                        onChange={handlePriceChange}
                    />
                </div>
                <Button type="submit">Create Service</Button>
            </form>
        </div>
    );
}

