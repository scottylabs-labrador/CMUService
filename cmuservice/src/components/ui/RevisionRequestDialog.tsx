// src/components/ui/RevisionRequestDialog.tsx

'use client';

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RevisionRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
}

export function RevisionRequestDialog({
  isOpen,
  onClose,
  onSubmit,
}: RevisionRequestDialogProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Revision</DialogTitle>
          <DialogDescription>
            Please describe the changes you would like the seller to make. Be as specific as possible.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
            <Label htmlFor="revision-comment">Changes requested:</Label>
            <Textarea 
                id="revision-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g., Please make the logo blue instead of red..."
                rows={5}
            />
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}