// src/components/ServiceCard.tsx

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";

type ServiceCardProps = {
  title: string;
  description?: string;
  category?: string;
  price: number;
  sellerId: string;
  sellerName: string;
  sellerAvatarUrl: string | null;
  imageUrl: string;
  avgRating?: number;
  reviewCount?: number;
  onDelete?: () => void;
};

export function ServiceCard(props: ServiceCardProps) {
  const {
    title,
    category,
    price,
    sellerId,
    sellerName,
    sellerAvatarUrl,
    imageUrl,
    onDelete,
  } = props;
  const router = useRouter();

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onDelete?.();
  };

  const handleProfileClick = (event: React.MouseEvent) => {
    // Add preventDefault() to stop the parent Link's navigation
    event.preventDefault();
    event.stopPropagation();
    router.push(`/profile/${sellerId}`);
  };

  return (
    <Card className="overflow-hidden relative flex flex-col h-full group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
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
        <div className="aspect-[16/10] relative overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          {/* Category Badge */}
          {category && (
            <Badge className="absolute bottom-2 left-2 bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-md">
              {category.toUpperCase()}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 flex-grow">
        {/* Price and Exchange Options */}
        <div className="flex items-center gap-2 mb-2">
          {price > 0 && (
            <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded-full">
              ${price}
            </span>
          )}
          {price > 0 && (
            <span className="text-xs text-muted-foreground">or</span>
          )}
          <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">
            Exchange
          </span>
        </div>

        <CardTitle className="text-base font-semibold line-clamp-1 mb-1">
          {title}
        </CardTitle>

        {/* Seller Info */}
        <div
          onClick={handleProfileClick}
          className="group/seller inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Avatar className="h-4 w-4">
            <AvatarImage src={sellerAvatarUrl || undefined} />
            <AvatarFallback className="text-[10px]">
              {sellerName ? sellerName.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <p className="text-xs text-muted-foreground group-hover/seller:text-primary transition-colors">
            {sellerName}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
