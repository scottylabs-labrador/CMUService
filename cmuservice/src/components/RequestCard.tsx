// src/components/RequestCard.tsx

'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "next/navigation";

type RequestCardProps = {
  title: string;
  budget: number;
  buyerId: string;
  buyerName: string;
  buyerAvatarUrl: string | null;
}

export function RequestCard(props: RequestCardProps) {
  const { title, budget, buyerId, buyerName, buyerAvatarUrl } = props;
  const router = useRouter();

  const handleProfileClick = (event: React.MouseEvent) => {
    // Add preventDefault() to stop the parent Link's navigation
    event.preventDefault();
    event.stopPropagation();
    router.push(`/profile/${buyerId}`);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-grow">
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        <div onClick={handleProfileClick} className="group inline-block mt-2 cursor-pointer">
          <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                  <AvatarImage src={buyerAvatarUrl || undefined} />
                  <AvatarFallback>{buyerName ? buyerName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground group-hover:text-primary group-hover:underline">{buyerName}</p>
          </div>
        </div>
      </CardHeader>
      <CardFooter>
        <p className="font-semibold">Budget: ${budget}</p>
      </CardFooter>
    </Card>
  );
}