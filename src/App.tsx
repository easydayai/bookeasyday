import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Home from "./pages/Home";
import Apply from "./pages/Apply";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import Testimonials from "./pages/Testimonials";
import Gallery from "./pages/Gallery";
import Policies from "./pages/Policies";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import Product from "./pages/Product";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminSetup from "./pages/admin/Setup";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminApplications from "./pages/admin/Applications";
import ApplicationDetail from "./pages/admin/ApplicationDetail";
import AdminPayments from "./pages/admin/Payments";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminTeam from "./pages/admin/Team";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes with Layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/apply" element={<Layout><Apply /></Layout>} />
          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          <Route path="/confirmation" element={<Layout><Confirmation /></Layout>} />
          <Route path="/testimonials" element={<Layout><Testimonials /></Layout>} />
          <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
          <Route path="/policies" element={<Layout><Policies /></Layout>} />
          <Route path="/faq" element={<Layout><FAQ /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
          <Route path="/product/:handle" element={<Layout><Product /></Layout>} />
          
          {/* Admin Routes (No main Layout) */}
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/applications/:id" element={<ApplicationDetail />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/team" element={<AdminTeam />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
