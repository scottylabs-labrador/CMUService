// src/components/ui/MakeOfferDialog.tsx

'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MakeOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (price: number, description: string) => void;
}

export function MakeOfferDialog({ isOpen, onClose, onSubmit }: MakeOfferDialogProps) {
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (price && description.trim()) {
      onSubmit(parseFloat(price), description);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>
            Submit your offer to the requester. Explain what you can do and your proposed price.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offer-price">Your Price ($)</Label>
            <Input id="offer-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 45" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-description">Offer Description</Label>
            <Textarea id="offer-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you will provide for this price..." />
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit Offer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}