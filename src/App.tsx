import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import EasyDayHome from "./pages/EasyDayHome";
import Solutions from "./pages/Solutions";
import Industries from "./pages/Industries";
import Demo from "./pages/Demo";
import EasyDayContact from "./pages/EasyDayContact";
import Policies from "./pages/Policies";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="easyday-theme" attribute="class">
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
            <Route path="/policies" element={<Layout><Policies /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
