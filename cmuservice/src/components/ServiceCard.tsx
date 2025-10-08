// src/components/ServiceCard.tsx

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";

type ServiceCardProps = {
  title: string;
  price: number;
  sellerName: string;
  imageUrl: string;
  avgRating?: number;
  reviewCount?: number;
  onDelete?: () => void;
}

export function ServiceCard(props: ServiceCardProps) {
  const { title, price, sellerName, imageUrl, avgRating = 0, reviewCount = 0, onDelete } = props;

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onDelete?.();
  };

  return (
    <Card className="overflow-hidden relative flex flex-col h-full">
      {onDelete && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 z-10 h-8 w-8"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image 
            src={imageUrl} 
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </CardHeader>
      
      {/* This content area will now grow to fill available space */}
      <CardContent className="p-4 flex-grow">
        {/* We use line-clamp to limit the title to 2 lines, preventing extreme height differences */}
        <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">by {sellerName}</p>
      </CardContent>

      {/* This footer will now be aligned at the bottom of all cards */}
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        {reviewCount > 0 ? (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold text-sm">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({reviewCount})</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No reviews yet</div>
        )}
        <p className="font-semibold">Starting at ${price}</p>
      </CardFooter>
    </Card>
  );
}