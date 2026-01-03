import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CalendarGrid } from "@/components/dashboard/CalendarGrid";
import { UpcomingEventsCard } from "@/components/dashboard/UpcomingEventsCard";
import { TasksCard } from "@/components/dashboard/TasksCard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_email: string;
  status: string;
  appointment_types: {
    name: string;
    duration_minutes: number;
  } | null;
}

// Sample tasks for demonstration
const SAMPLE_TASKS = [
  { id: "1", title: "Review quarterly goals", completed: true },
  { id: "2", title: "Prepare client presentation", completed: true },
  { id: "3", title: "Update portfolio website", completed: false },
  { id: "4", title: "Send follow-up emails", completed: true },
  { id: "5", title: "Schedule team meeting", completed: false },
  { id: "6", title: "Complete expense report", completed: true },
  { id: "7", title: "Review contract drafts", completed: true },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, isLoading, isProfileComplete } = useAuth();
  const { toast } = useToast();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [tasks, setTasks] = useState(SAMPLE_TASKS);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Redirect to onboarding if profile is incomplete
  useEffect(() => {
    if (!isLoading && user && !isProfileComplete) {
      navigate("/onboarding");
    }
  }, [user, isLoading, isProfileComplete, navigate]);

  useEffect(() => {
    if (user) {
      fetchUpcomingBookings();
    }
  }, [user]);

  const fetchUpcomingBookings = async () => {
    if (!user) return;

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          start_time,
          end_time,
          customer_name,
          customer_email,
          status,
          appointment_types (
            name,
            duration_minutes
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "booked")
        .gte("start_time", now)
        .order("start_time", { ascending: true })
        .limit(5);

      if (error) throw error;
      setUpcomingBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleAddEvent = () => {
    toast({
      title: "Add Event",
      description: "Event creation coming soon!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Transform bookings to calendar events format
  const calendarEvents = upcomingBookings.map((booking) => ({
    id: booking.id,
    title: booking.customer_name,
    date: new Date(booking.start_time),
    type: "meeting" as const,
  }));

  // Transform bookings to upcoming events format
  const upcomingEvents = upcomingBookings.map((booking) => ({
    id: booking.id,
    title: booking.appointment_types?.name || booking.customer_name,
    date: new Date(booking.start_time).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    time: new Date(booking.start_time).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    type: "meeting" as const,
  }));

  const completedTasks = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Fixed Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <DashboardHeader userName={profile?.full_name || undefined} />

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Calendar (Takes 2 columns on xl) */}
            <div className="xl:col-span-2 space-y-6">
              <CalendarGrid events={calendarEvents} onAddEvent={handleAddEvent} />
              
              {/* Stats Section */}
              <StatsCards
                totalEvents={upcomingBookings.length}
                tasksCompleted={completedTasks}
                totalTasks={tasks.length}
                hoursLogged={24}
              />
            </div>

            {/* Right Column - Cards */}
            <div className="space-y-6">
              <UpcomingEventsCard events={upcomingEvents} />
              <TasksCard tasks={tasks} onToggle={handleToggleTask} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
