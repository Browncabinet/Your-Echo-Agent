import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CreditsProvider } from "@/hooks/use-credits";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Pricing from "./pages/Pricing.tsx";
import About from "./pages/About.tsx";
import NotFound from "./pages/NotFound.tsx";
import CheckoutReturn from "./pages/CheckoutReturn.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CreditsProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/checkout/return" element={<ProtectedRoute><CheckoutReturn /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CreditsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
