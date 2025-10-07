// src/components/ServiceCard.tsx

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type ServiceCardProps = {
  title: string;
  price: number;
  sellerName: string;
  imageUrl: string;
  onDelete?: () => void;
}

export function ServiceCard(props: ServiceCardProps) {
  const { title, price, sellerName, imageUrl, onDelete } = props;

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onDelete?.();
  };

  return (
    <Card className="overflow-hidden relative">
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
      <CardContent className="p-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">by {sellerName}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <p className="font-semibold">Starting at ${price}</p>
      </CardFooter>
    </Card>
  );
}