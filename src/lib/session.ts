import { supabase } from "@/integrations/supabase/client";

export const handleSessionRefresh = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      // If session is invalid or expired, sign out
      await supabase.auth.signOut();
      return null;
    }

    // Check if token is about to expire (within 5 minutes)
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;
      
      // If less than 5 minutes until expiry, refresh
      if (timeUntilExpiry < 300) {
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          await supabase.auth.signOut();
          return null;
        }
        return data.session;
      }
    }

    return session;
  } catch (error) {
    console.error('Session refresh error:', error);
    await supabase.auth.signOut();
    return null;
  }
};

export const setupSessionRefresh = () => {
  // Refresh session every 4 minutes
  setInterval(async () => {
    await handleSessionRefresh();
  }, 4 * 60 * 1000);
};
