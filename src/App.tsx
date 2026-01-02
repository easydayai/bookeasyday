import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import EasyDayHome from "./pages/EasyDayHome";
import Solutions from "./pages/Solutions";
import Industries from "./pages/Industries";
import Demo from "./pages/Demo";
import EasyDayContact from "./pages/EasyDayContact";
import Policies from "./pages/Policies";
import Pricing from "./pages/Pricing";
import Affiliate from "./pages/Affiliate";
import AffiliateLegal from "./pages/AffiliateLegal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><EasyDayHome /></Layout>} />
          <Route path="/solutions" element={<Layout><Solutions /></Layout>} />
          <Route path="/industries" element={<Layout><Industries /></Layout>} />
          <Route path="/demo" element={<Layout><Demo /></Layout>} />
          <Route path="/contact" element={<Layout><EasyDayContact /></Layout>} />
          <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
          <Route path="/affiliate" element={<Layout><Affiliate /></Layout>} />
          <Route path="/affiliate-legal" element={<Layout><AffiliateLegal /></Layout>} />
          <Route path="/policies" element={<Layout><Policies /></Layout>} />
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
