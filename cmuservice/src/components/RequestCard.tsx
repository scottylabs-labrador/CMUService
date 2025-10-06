// src/components/RequestCard.tsx

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type RequestCardProps = {
  title: string;
  budget: number;
  buyerName: string;
}

export function RequestCard(props: RequestCardProps) {
  const { title, budget, buyerName } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>by {buyerName}</CardDescription>
      </CardHeader>
      <CardFooter>
        <p className="font-semibold">Budget: ${budget}</p>
      </CardFooter>
    </Card>
  );
}