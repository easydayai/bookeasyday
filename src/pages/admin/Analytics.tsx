import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    approvalRate: 0,
    topLocations: [] as { city: string; state: string; count: number }[],
    applicationsByDay: [] as { date: string; count: number }[],
    sourceBreakdown: [] as { source: string; count: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: applications } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!applications) return;

      // Total applications
      const totalApplications = applications.length;

      // Approval rate
      const approved = applications.filter((a) => a.status === "approved").length;
      const approvalRate = totalApplications > 0 ? (approved / totalApplications) * 100 : 0;

      // Top locations
      const locationMap = new Map<string, number>();
      applications.forEach((app) => {
        const key = `${app.city}, ${app.state}`;
        locationMap.set(key, (locationMap.get(key) || 0) + 1);
      });
      const topLocations = Array.from(locationMap.entries())
        .map(([location, count]) => {
          const [city, state] = location.split(", ");
          return { city, state, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Applications by day (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      }).reverse();

      const applicationsByDay = last7Days.map((date) => ({
        date,
        count: applications.filter(
          (a) => a.created_at.split("T")[0] === date
        ).length,
      }));

      // Source breakdown
      const sourceMap = new Map<string, number>();
      applications.forEach((app) => {
        if (app.source) {
          sourceMap.set(app.source, (sourceMap.get(app.source) || 0) + 1);
        }
      });
      const sourceBreakdown = Array.from(sourceMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      setAnalytics({
        totalApplications,
        approvalRate,
        topLocations,
        applicationsByDay,
        sourceBreakdown,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Insights into your Rent EZ applications</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.approvalRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">
                      {location.city}, {location.state}
                    </span>
                  </div>
                  <span className="text-muted-foreground">{location.count} applications</span>
                </div>
              ))}
              {analytics.topLocations.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No location data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Applications by Day */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Per Day (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.applicationsByDay.map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${
                            analytics.totalApplications > 0
                              ? (day.count / analytics.totalApplications) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        {analytics.sourceBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Application Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.sourceBreakdown.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{source.source}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${
                              analytics.totalApplications > 0
                                ? (source.count / analytics.totalApplications) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {source.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
