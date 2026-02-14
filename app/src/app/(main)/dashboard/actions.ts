'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function clearAllNotifications() {
  const supabase = await createClient();

  const { userId } = await auth();

  if (!userId) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error clearing notifications:', error);
    return { error: 'Failed to clear notifications' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
