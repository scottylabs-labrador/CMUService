// src/components/OrderChat.tsx

'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

type Message = {
    id: string;
    created_at: string;
    sender_id: string;
    message_text: string;
};

interface OrderChatProps {
    orderId: string;
    user: User;
}

export function OrderChat({ orderId, user }: OrderChatProps) {
    const supabase = createClient();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    // Fetch initial messages
    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('order_id', orderId)
                .order('created_at', { ascending: true });
            
            if (error) console.error("Error fetching messages:", error);
            else setMessages(data);
        };
        fetchMessages();
    }, [orderId, supabase]);

    // Listen for new messages in real-time
    useEffect(() => {
        const channel = supabase
            .channel(`messages:${orderId}`)
            .on(
                'postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` },
                (payload) => {
                    setMessages(currentMessages => [...currentMessages, payload.new as Message]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId, supabase]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        await supabase
            .from('messages')
            .insert({
                order_id: orderId,
                sender_id: user.id,
                message_text: newMessage,
            });
        
        setNewMessage(""); // Clear the input field
    };

    return (
        <Card>
            <CardHeader><CardTitle>Order Chat</CardTitle></CardHeader>
            <CardContent className="space-y-4 h-96 overflow-y-auto">
                {messages.map((message) => (
                    <div 
                        key={message.id} 
                        className={`flex flex-col ${message.sender_id === user.id ? 'items-end' : 'items-start'}`}
                    >
                        <div 
                            className={`max-w-xs p-3 rounded-lg ${message.sender_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                        >
                            <p>{message.message_text}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="flex gap-2">
                <Textarea 
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                />
                <Button onClick={handleSendMessage}>Send</Button>
            </CardFooter>
        </Card>
    );
}