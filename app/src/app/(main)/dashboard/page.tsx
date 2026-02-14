// src/app/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ListOrdered,
  PlusCircle,
  ShoppingCart,
  DollarSign,
  Bell,
  ShoppingBag,
  FolderKanban,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const { user } = useAuth();

  const [serviceCount, setServiceCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [activeSalesCount, setActiveSalesCount] = useState(0);
  const [activePurchasesCount, setActivePurchasesCount] = useState(0);
  const [processedNotifications, setProcessedNotifications] = useState<
    ProcessedNotification[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch counts
      const { count: sCount } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      const { count: rCount } = await supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      const { count: asCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .not("status", "eq", "completed");
      const { count: apCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("buyer_id", user.id)
        .not("status", "eq", "completed");
      setServiceCount(sCount ?? 0);
      setRequestCount(rCount ?? 0);
      setActiveSalesCount(asCount ?? 0);
      setActivePurchasesCount(apCount ?? 0);

      // Fetch notifications
      const { data: notifications } = await supabase
        .from("notifications")
        .select("*, orders(services(title))")
        .eq("recipient_id", user.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const groupedNotifications = new Map<string, any>();
      const newProcessedNotifications: ProcessedNotification[] = [];

      if (notifications) {
        for (const notification of notifications) {
          if (notification.notification_type === "new_message") {
            if (!groupedNotifications.has(notification.order_id)) {
              groupedNotifications.set(notification.order_id, {
                ...notification,
                count: 0,
              });
            }
            groupedNotifications.get(notification.order_id).count++;
          } else {
            newProcessedNotifications.push({
              order_id: notification.order_id,
              notification_type: notification.notification_type,
              content: `${notification.content} for "${
                notification.orders?.services?.title || "a deleted service"
              }"`,
              created_at: notification.created_at,
            });
          }
        }
        groupedNotifications.forEach((group) => {
          newProcessedNotifications.push({
            order_id: group.order_id,
            notification_type: "new_message_group",
            content: `${group.count} new message${
              group.count > 1 ? "s" : ""
            } in your order for "${
              group.orders?.services?.title || "a deleted service"
            }"`,
            created_at: group.created_at,
          });
        });
        newProcessedNotifications.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setProcessedNotifications(newProcessedNotifications);
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase, router, user]);

  const handleClearNotifications = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error clearing notifications:", error);
    } else {
      setProcessedNotifications([]);
    }
  };

  const handleNotificationClick = async (
    orderId: string,
    notificationType: string
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", user.id)
      .eq("order_id", orderId)
      .like(
        "notification_type",
        notificationType === "new_message_group"
          ? "new_message"
          : notificationType
      );

    if (error) {
      console.error("Error marking notification as read:", error);
    }

    setProcessedNotifications((prev) =>
      prev.filter(
        (n) =>
          n.order_id !== orderId ||
          (notificationType !== "new_message_group" &&
            n.notification_type !== notificationType)
      )
    );

    router.push(`/orders/${orderId}`);
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Overview</h1>
      <p className="text-muted-foreground mt-2">
        Here&apos;s a summary of your activity on the platform.
      </p>

      <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/my-services" className="block">
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-neutral-100 to-neutral-200">
            <Card className="rounded-2xl transition-all cursor-pointer bg-white/20 border-white/30 backdrop-blur-lg hover:bg-[rgba(238,119,82,0.18)] hover:ring-2 hover:ring-[#ee7752]/40 hover:shadow-xl hover:shadow-[#ee7752]/20 hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  My Services
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{serviceCount}</div>
                <p className="text-xs text-muted-foreground">
                  active services you are offering
                </p>
              </CardContent>
            </Card>
          </div>
        </Link>
        <Link href="/dashboard/my-requests" className="block">
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-neutral-100 to-neutral-200">
            <Card className="rounded-2xl transition-all cursor-pointer bg-white/20 border-white/30 backdrop-blur-lg hover:bg-[rgba(231,60,126,0.18)] hover:ring-2 hover:ring-[#e73c7e]/40 hover:shadow-xl hover:shadow-[#e73c7e]/20 hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  My Requests
                </CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requestCount}</div>
                <p className="text-xs text-muted-foreground">
                  open requests you have posted
                </p>
              </CardContent>
            </Card>
          </div>
        </Link>
        <Link href="/dashboard/selling" className="block">
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-neutral-100 to-neutral-200">
            <Card className="rounded-2xl transition-all cursor-pointer bg-white/20 border-white/30 backdrop-blur-lg hover:bg-[rgba(35,166,213,0.18)] hover:ring-2 hover:ring-[#23a6d5]/40 hover:shadow-xl hover:shadow-[#23a6d5]/20 hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Selling
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSalesCount}</div>
                <p className="text-xs text-muted-foreground">
                  orders you need to fulfill
                </p>
              </CardContent>
            </Card>
          </div>
        </Link>
        <Link href="/dashboard/buying" className="block">
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-neutral-100 to-neutral-200">
            <Card className="rounded-2xl transition-all cursor-pointer bg-white/20 border-white/30 backdrop-blur-lg hover:bg-[rgba(35,213,171,0.18)] hover:ring-2 hover:ring-[#23d5ab]/40 hover:shadow-xl hover:shadow-[#23d5ab]/20 hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Purchases
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePurchasesCount}</div>
                <p className="text-xs text-muted-foreground">
                  orders you are waiting for
                </p>
              </CardContent>
            </Card>
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Notifications</h2>
          {processedNotifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearNotifications}
            >
              Clear All
            </Button>
          )}
        </div>
        {processedNotifications.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y max-h-[420px] overflow-y-auto">
                {processedNotifications.map((notif, index) => (
                  <div
                    key={index}
                    className="block p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() =>
                      handleNotificationClick(
                        notif.order_id,
                        notif.notification_type
                      )
                    }
                  >
                    <div className="flex items-start gap-4">
                      <Bell className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-snug">
                          {notif.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {formatTimeAgo(notif.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            You have no new notifications.
          </p>
        )}
      </div>
    </div>
  );
}
