// src/components/ServiceCard.tsx

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

// Define the "shape" of the data our component will receive
type ServiceCardProps = {
  title: string;
  price: number;
  sellerName: string;
  imageUrl: string;
}

export function ServiceCard(props: ServiceCardProps) {
  const { title, price, sellerName, imageUrl } = props; // Destructure props for easier use

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          {/* Use the imageUrl from props */}
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
        {/* Use the title from props */}
        <CardTitle className="text-lg">{title}</CardTitle>
        {/* Use the sellerName from props */}
        <p className="text-sm text-muted-foreground mt-1">by {sellerName}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {/* Use the price from props */}
        <p className="font-semibold">Starting at ${price}</p>
      </CardFooter>
    </Card>
  );
}