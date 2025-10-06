import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function MyRequestsPage() {
    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Requests</h1>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Request
                </Button>
            </div>
            <div className="mt-8">
                <p className="text-muted-foreground">You haven&apos;t created any requests yet. Click the button to get started!</p>
            </div>
        </div>
    );
}
