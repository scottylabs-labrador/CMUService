// src/components/OrderChat.tsx

'use client';

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { CheckCircle2, Package, RotateCw } from "lucide-react";
import { Separator } from "./ui/separator";

type Message = {
    id: string;
    created_at: string;
    sender_id: string;
    message_text: string;
    message_type: string;
};

interface OrderChatProps {
    orderId: string;
    user: User;
}

export function OrderChat({ orderId, user }: OrderChatProps) {
    const supabase = createClient();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase.from('messages').select('*').eq('order_id', orderId).order('created_at', { ascending: true });
            if (error) console.error("Error fetching messages:", error);
            else setMessages(data);
        };
        fetchMessages();
    }, [orderId, supabase]);

    useEffect(() => {
        const channel = supabase.channel(`messages:${orderId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` }, (payload) => {
            setMessages(currentMessages => [...currentMessages, payload.new as Message]);
        }).subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId, supabase]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        await supabase.from('messages').insert({ order_id: orderId, sender_id: user.id, message_text: newMessage });
        setNewMessage("");
    };

    return (
        <Card>
            <CardHeader><CardTitle>Order Chat</CardTitle></CardHeader>
            <CardContent ref={chatContainerRef} className="space-y-4 h-96 overflow-y-auto p-4">
                {messages.map((message) => {
                    if (message.message_type.startsWith('event_')) {
                        let Icon = Package;
                        if (message.message_type === 'event_completed') Icon = CheckCircle2;
                        if (message.message_type === 'event_revision_request') Icon = RotateCw;
                        
                        return (
                            <div key={message.id} className="flex items-center justify-center gap-2 my-4">
                                <Separator className="flex-1" />
                                <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <p className="text-sm text-muted-foreground italic text-center">{message.message_text}</p>
                                <Separator className="flex-1" />
                            </div>
                        );
                    }
                    
                    return (
                        <div key={message.id} className={`flex flex-col ${message.sender_id === user.id ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-xs p-3 rounded-lg ${message.sender_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p className="text-sm whitespace-pre-wrap break-words">{message.message_text}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </p>
                        </div>
                    );
                })}
            </CardContent>
            <CardFooter className="flex gap-2 border-t pt-4">
                <Textarea placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} rows={1} />
                <Button onClick={handleSendMessage}>Send</Button>
            </CardFooter>
        </Card>
    );
}