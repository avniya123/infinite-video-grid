import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuickActionsMenu } from "@/components/QuickActionsMenu";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setupSessionRefresh } from "@/lib/session";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import TemplateEditor from "./pages/TemplateEditor";
import MyTemplates from "./pages/MyTemplates";
import MyUsers from "./pages/MyUsers";
import PublishCart from "./pages/PublishCart";
import ShareCartCheckout from "./pages/ShareCartCheckout";
import MyBills from "./pages/MyBills";
import MyVideos from "./pages/MyVideos";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on JWT expired errors
        if (error?.code === 'PGRST303' || error?.message?.includes('JWT expired')) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => {
  useEffect(() => {
    // Setup automatic session refresh
    setupSessionRefresh();

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT' || !session) {
        // Clear expired session data
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <QuickActionsMenu />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/videos" element={<Index />} />
            <Route path="/my-templates" element={<MyTemplates />} />
            <Route path="/my-videos" element={<MyVideos />} />
            <Route path="/my-users" element={<MyUsers />} />
            <Route path="/my-bills" element={<MyBills />} />
            <Route path="/publish-cart" element={<PublishCart />} />
            <Route path="/share-cart-checkout" element={<ShareCartCheckout />} />
            <Route path="/template-editor/:variationId" element={<TemplateEditor />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
