// src/components/OrderChat.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { CheckCircle2, Package, RotateCw, ImageIcon, X } from "lucide-react";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import Image from "next/image";

type Message = {
  id: string;
  created_at: string;
  sender_id: string;
  message_text: string;
  message_type: string;
  image_url?: string;
};

interface OrderChatProps {
  order: { id: string; buyer_id: string; seller_id: string };
  user: User;
}

export function OrderChat({ order, user }: OrderChatProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: true });
      if (error) console.error("Error fetching messages:", error);
      else setMessages(data);
    };
    fetchMessages();
  }, [order.id, supabase]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${order.id}`,
        },
        (payload) => {
          setMessages((currentMessages) => [
            ...currentMessages,
            payload.new as Message,
          ]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id, supabase]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;

    const recipientId =
      user.id === order.buyer_id ? order.seller_id : order.buyer_id;
    let imageUrl = null;

    // Upload image if selected
    if (selectedImage) {
      const filePath = `chat-images/${order.id}/${Date.now()}_${
        selectedImage.name
      }`;

      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(filePath, selectedImage);

      if (uploadError) {
        console.log("Error uploading image:", JSON.stringify(uploadError));
        alert("Error uploading image. Please try again.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-images").getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    const messageText = newMessage.trim() || (imageUrl ? "[Image]" : "");

    const { error: messageError } = await supabase.from("messages").insert({
      order_id: order.id,
      sender_id: user.id,
      message_text: messageText,
      message_type: "text",
      image_url: imageUrl,
    });

    if (messageError) {
      console.log("Error sending message:", JSON.stringify(messageError));
      alert(`Failed to send message: ${messageError.message}`);
      return;
    }

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        recipient_id: recipientId,
        sender_id: user.id,
        order_id: order.id,
        notification_type: "new_message",
        content: imageUrl
          ? "You have a new image message"
          : "You have a new message",
      });

    if (notificationError) {
      console.log(
        "Error creating notification for new message:",
        JSON.stringify(notificationError)
      );
    }

    setNewMessage("");
    removeImage();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Chat</CardTitle>
      </CardHeader>
      <CardContent
        ref={chatContainerRef}
        className="space-y-4 h-96 overflow-y-auto p-4"
      >
        {messages.map((message) => {
          if (message.message_type.startsWith("event_")) {
            let Icon = Package;
            if (message.message_type === "event_completed") Icon = CheckCircle2;
            if (message.message_type === "event_revision_request")
              Icon = RotateCw;

            return (
              <div
                key={message.id}
                className="flex items-center justify-center gap-2 my-4"
              >
                <Separator className="flex-1" />
                <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground italic text-center">
                  {message.message_text}
                </p>
                <Separator className="flex-1" />
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.sender_id === user.id ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-xs rounded-lg ${
                  message.sender_id === user.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.image_url && (
                  <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                    <Image
                      src={message.image_url}
                      alt="Chat image"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {message.message_text && message.message_text !== "[Image]" && (
                  <div className="p-3">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.message_text}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t pt-4">
        {imagePreview && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
            <Image
              src={imagePreview}
              alt="Image preview"
              fill
              className="object-cover"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-1 right-1 w-6 h-6 p-0"
              onClick={removeImage}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        <div className="flex gap-2 w-full">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={1}
            className="flex-1"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
