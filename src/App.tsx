import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CreditsProvider } from "@/hooks/use-credits";
import { SubscriptionProvider } from "@/hooks/use-subscription";
import { Footer } from "@/components/Footer";
import Auth from "./pages/Auth.tsx";
import Pricing from "./pages/Pricing.tsx";
import About from "./pages/About.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import AcceptableUse from "./pages/AcceptableUse.tsx";
import ForAgents from "./pages/ForAgents.tsx";
import NotFound from "./pages/NotFound.tsx";
import CheckoutReturn from "./pages/CheckoutReturn.tsx";
import PartnerBilling from "./pages/PartnerBilling.tsx";
import PartnerDashboard from "./pages/PartnerDashboard.tsx";
import ForAgentsDocs from "./pages/ForAgentsDocs.tsx";
import PartnerRegisterAgent from "./pages/PartnerRegisterAgent.tsx";
import PartnerSignup from "./pages/PartnerSignup.tsx";
import PartnerLogin from "./pages/PartnerLogin.tsx";

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
        <Footer />
      </div>
    );
  }
  return <Navigate to={user ? "/for-agents/dashboard" : "/for-agents"} replace />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CreditsProvider>
            <SubscriptionProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/acceptable-use" element={<AcceptableUse />} />
                <Route path="/for-agents" element={<ForAgents />} />
                <Route path="/for-agents/signup" element={<PartnerSignup />} />
                <Route path="/for-agents/billing" element={<ProtectedRoute><PartnerBilling /></ProtectedRoute>} />
                <Route path="/for-agents/dashboard" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />
                <Route path="/for-agents/docs" element={<ForAgentsDocs />} />
                <Route path="/for-agents/register" element={<ProtectedRoute><PartnerRegisterAgent /></ProtectedRoute>} />
                <Route path="/checkout/return" element={<ProtectedRoute><CheckoutReturn /></ProtectedRoute>} />
                <Route path="/" element={<HomeRoute />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SubscriptionProvider>
          </CreditsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
