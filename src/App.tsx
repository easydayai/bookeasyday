import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import EasyDayHome from "./pages/EasyDayHome";
import Solutions from "./pages/Solutions";
import Demo from "./pages/Demo";
import EasyDayContact from "./pages/EasyDayContact";
import Policies from "./pages/Policies";
import Pricing from "./pages/Pricing";
import Affiliate from "./pages/Affiliate";
import AffiliateLegal from "./pages/AffiliateLegal";
import TalkToDaisy from "./pages/TalkToDaisy";
import ManageBooking from "./pages/ManageBooking";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Subscribe from "./pages/Subscribe";
import Checkout from "./pages/Checkout";
import UpgradeSuccess from "./pages/UpgradeSuccess";

// Dashboard pages
import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/settings/ProfileSettings";
import AvailabilitySettings from "./pages/settings/AvailabilitySettings";
import AppointmentTypesSettings from "./pages/settings/AppointmentTypesSettings";
import AppointmentsPage from "./pages/dashboard/AppointmentsPage";

// Public booking
import BookingPage from "./pages/BookingPage";
import BookingSuccess from "./pages/BookingSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<Layout><EasyDayHome /></Layout>} />
            <Route path="/solutions" element={<Layout><Solutions /></Layout>} />
            <Route path="/demo" element={<Layout><Demo /></Layout>} />
            <Route path="/contact" element={<Layout><EasyDayContact /></Layout>} />
            <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
            <Route path="/talk-to-daisy" element={<Layout><TalkToDaisy /></Layout>} />
            <Route path="/affiliate" element={<Layout><Affiliate /></Layout>} />
            <Route path="/affiliate-legal" element={<Layout><AffiliateLegal /></Layout>} />
            <Route path="/policies" element={<Layout><Policies /></Layout>} />
            <Route path="/manage-booking/:eventId" element={<Layout><ManageBooking /></Layout>} />

            {/* Auth pages (no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/upgrade-success" element={<UpgradeSuccess />} />

            {/* Dashboard pages (no layout - custom header) */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings/profile" element={<ProfileSettings />} />
            <Route path="/settings/availability" element={<AvailabilitySettings />} />
            <Route path="/settings/appointment-types" element={<AppointmentTypesSettings />} />
            <Route path="/dashboard/appointments" element={<AppointmentsPage />} />

            {/* Public booking */}
            <Route path="/book/:slug" element={<BookingPage />} />
            <Route path="/book/:slug/success" element={<BookingSuccess />} />

            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
