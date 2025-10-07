// src/app/requests/[requestId]/page.tsx

import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Edit } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function RequestDetailPage({ params }: { params: { requestId: string } }) {
    const supabase = createClient();
    const { data: request, error } = await supabase.from('requests').select('*').eq('id', params.requestId).single();
    const { data: { user } } = await supabase.auth.getUser();

    if (error || !request) {
        return (
            <div className="container mx-auto p-4">
                <Button asChild variant="outline" className="mb-8">
                    <Link href="/requests">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Requests
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Request not found</h1>
            </div>
        );
    }

    const isOwner = user && user.id === request.user_id;
    const backPath = isOwner ? "/dashboard/my-requests" : "/requests";

    return (
        <div className="container mx-auto p-4">
            <Button asChild variant="outline" className="mb-8">
                <Link href={backPath}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Link>
            </Button>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Posted by A CMU Student</p>
                    <h1 className="text-4xl font-bold mt-2">{request.title}</h1>
                    {request.description && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold">Description</h2>
                            <p className="text-muted-foreground mt-4 whitespace-pre-wrap break-words">{request.description}</p>
                        </div>
                    )}
                </div>
                <div className="md:col-span-1">
                     <div className="p-6 border rounded-lg">
                        <p className="text-lg">Budget</p>
                        <p className="text-3xl font-bold">${request.budget}</p>
                        <div className="mt-6">
                            {isOwner ? ( <Button size="lg" className="w-full" asChild><Link href={`/dashboard/my-requests/edit/${request.id}`}><Edit className="mr-2 h-5 w-5" />Edit Request</Link></Button>
                            ) : ( <Button size="lg" className="w-full">Make an Offer</Button> )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}