import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function MyRequestsPage() {
    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Requests</h1>
                <Button asChild>
                    <Link href="/dashboard/my-requests/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Request
                    </Link>
                </Button>
            </div>
            <div className="mt-8">
                <p className="text-muted-foreground">You haven&apos;t posted any requests yet. Click the button to get started!</p>
            </div>
        </div>
    );
}

