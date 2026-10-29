import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import PaymentCallback from "./pages/PaymentCallback";
import KYC from "./pages/KYC";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Apply from "./pages/Apply";
import ApplicationSuccess from "./pages/application-success";
import ContractSigning from "./pages/ContractSigning";
import Insurance from "./pages/Insurance";
import InsuranceCallback from "./pages/InsuranceCallback";
import InsuranceTerms from "./pages/InsuranceTerms";
import Referral from "./pages/Referral";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/payment-callback" element={<PaymentCallback />} />
              <Route path="/kyc" element={<KYC />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/application-success" element={<ApplicationSuccess />} />
              <Route path="/contracts/:id/sign" element={<ContractSigning />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/insurance/terms" element={<InsuranceTerms />} />
              <Route path="/insurance-callback" element={<InsuranceCallback />} />
              <Route path="/referral" element={<Referral />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
