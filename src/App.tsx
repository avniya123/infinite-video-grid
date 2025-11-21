import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import TemplateEditor from "./pages/TemplateEditor";
import MyTemplates from "./pages/MyTemplates";
import MyUsers from "./pages/MyUsers";
import PublishCart from "./pages/PublishCart";
import ShareCartCheckout from "./pages/ShareCartCheckout";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`min-h-screen ${
        transitionStage === 'fadeOut' ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onAnimationEnd={() => {
        if (transitionStage === 'fadeOut') {
          setTransitionStage('fadeIn');
          setDisplayLocation(location);
        }
      }}
    >
      <Routes location={displayLocation}>
        <Route path="/" element={<Landing />} />
        <Route path="/videos" element={<Index />} />
        <Route path="/my-templates" element={<MyTemplates />} />
        <Route path="/my-users" element={<MyUsers />} />
        <Route path="/publish-cart" element={<PublishCart />} />
        <Route path="/share-cart-checkout" element={<ShareCartCheckout />} />
        <Route path="/template-editor/:variationId" element={<TemplateEditor />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
