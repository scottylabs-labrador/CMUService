// src/app/dashboard/page.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ListOrdered, PlusCircle, ShoppingCart, DollarSign } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // --- Fetch the counts directly from the database ---

  // 1. Get the count of the user's services
  const { count: serviceCount, error: serviceError } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // 2. Get the count of the user's requests
  const { count: requestCount, error: requestError } = await supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  // 3. Get the count of active sales (where user is the SELLER)
  const { count: activeSalesCount, error: salesError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', user.id)
    .not('status', 'eq', 'completed');

  // 4. Get the count of active purchases (where user is the BUYER)
  const { count: activePurchasesCount, error: purchasesError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', user.id)
    .not('status', 'eq', 'completed');

  if (serviceError || requestError || salesError || purchasesError) {
    console.error("Error fetching dashboard counts:", { serviceError, requestError, salesError, purchasesError });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Overview</h1>
      <p className="text-muted-foreground mt-2">
        Here&apos;s a summary of your activity on the platform.
      </p>

      <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-4">
        {/* --- My Services Card --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Services</CardTitle>
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              active services you are offering
            </p>
          </CardContent>
        </Card>

        {/* --- My Requests Card --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Requests</CardTitle>
             <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requestCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              open requests you have posted
            </p>
          </CardContent>
        </Card>
        
        {/* --- New Active Sales Card --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sales</CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSalesCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              orders you need to fulfill
            </p>
          </CardContent>
        </Card>

        {/* --- New Active Purchases Card --- */}
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Purchases</CardTitle>
             <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePurchasesCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              orders you are waiting for
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}