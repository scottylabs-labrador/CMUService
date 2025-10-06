import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function MyServicesPage() {
    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Services</h1>
                <Button asChild>
                    <Link href="/dashboard/my-services/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Service
                    </Link>
                </Button>
            </div>
            <div className="mt-8">
                <p className="text-muted-foreground">You haven&apos;t created any services yet. Click the button to get started!</p>
            </div>
        </div>
    );
}

