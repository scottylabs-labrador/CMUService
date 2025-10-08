// src/app/dashboard/page.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ListOrdered, PlusCircle, ShoppingCart, DollarSign, Bell } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type NotificationWithRelations = {
  id: number;
  created_at: string;
  recipient_id: string;
  sender_id: string;
  order_id: string;
  notification_type: string;
  content: string | null;
  is_read: boolean;
  orders: {
    services: {
      title: string;
    } | null;
  } | null;
};

type ProcessedNotification = {
    order_id: string;
    notification_type: string;
    content: string;
    created_at: string;
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { return redirect('/login'); }

  const { count: serviceCount, error: serviceError } = await supabase.from('services').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const { count: requestCount, error: requestError } = await supabase.from('requests').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const { count: activeSalesCount, error: salesError } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('seller_id', user.id).not('status', 'eq', 'completed');
  const { count: activePurchasesCount, error: purchasesError } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id).not('status', 'eq', 'completed');

  if (serviceError || requestError || salesError || purchasesError) {
    console.error("Error fetching dashboard counts:", { serviceError, requestError, salesError, purchasesError });
  }

  const { data: notifications } = await supabase.from('notifications').select('*, orders(services(title))').eq('recipient_id', user.id).eq('is_read', false).order('created_at', { ascending: false });
  const groupedNotifications = new Map<string, NotificationWithRelations & { count: number }>();
  const processedNotifications: ProcessedNotification[] = [];

  if (notifications) {
    for (const notification of notifications) {
        if (notification.notification_type === 'new_message') {
            if (!groupedNotifications.has(notification.order_id)) { 
                groupedNotifications.set(notification.order_id, { ...notification, count: 0 }); 
            }
            const group = groupedNotifications.get(notification.order_id);
            if (group) {
              group.count++;
            }
        } else {
            processedNotifications.push({ 
                order_id: notification.order_id, 
                notification_type: notification.notification_type, 
                content: `${notification.content} for "${notification.orders?.services?.title || 'a deleted service'}"`, 
                created_at: notification.created_at, 
            });
        }
    }
    groupedNotifications.forEach(group => {
        processedNotifications.push({ 
            order_id: group.order_id, 
            notification_type: 'new_message_group', 
            content: `${group.count} new message${group.count > 1 ? 's' : ''} in your order for "${group.orders?.services?.title || 'a deleted service'}"`, 
            created_at: group.created_at, 
        });
    });
    processedNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  return (
    <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground mt-2">Here&apos;s a summary of your activity on the platform.</p>
        
        <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">My Services</CardTitle>
                    <PlusCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{serviceCount ?? 0}</div>
                    <p className="text-xs text-muted-foreground">active services you are offering</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">My Requests</CardTitle>
                    <ListOrdered className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{requestCount ?? 0}</div>
                    <p className="text-xs text-muted-foreground">open requests you have posted</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Active Sales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeSalesCount ?? 0}</div>
                    <p className="text-xs text-muted-foreground">orders you need to fulfill</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Active Purchases</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activePurchasesCount ?? 0}</div>
                    <p className="text-xs text-muted-foreground">orders you are waiting for</p>
                </CardContent>
            </Card>
        </div>

        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
            {processedNotifications.length > 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y max-h-[420px] overflow-y-auto">
                            {processedNotifications.map((notif, index) => (
                                <Link href={`/orders/${notif.order_id}`} key={index} className="block p-3 hover:bg-muted/50">
                                    <div className="flex items-start gap-4">
                                        <Bell className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium leading-snug">{notif.content}</p>
                                            <p className="text-xs text-muted-foreground mt-1.5">
                                                {formatTimeAgo(notif.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : ( 
                <p className="text-sm text-muted-foreground">You have no new notifications.</p> 
            )}
        </div>
    </div>
  );
}