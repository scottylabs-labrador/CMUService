'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function clearAllNotifications() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error clearing notifications:', error);
    return { error: 'Failed to clear notifications' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
