import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle, XCircle, Download } from "lucide-react";
import { toast } from "sonner";

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setApplication(data);
      setInternalNotes(data.internal_notes || "");
    } catch (error) {
      console.error("Error loading application:", error);
      toast.error("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("applications")
        .update({
          status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          internal_notes: internalNotes,
        })
        .eq("id", id);

      if (error) throw error;

      await supabase.from("activity_logs").insert({
        user_id: user?.id,
        action: "approve_application",
        entity_type: "application",
        entity_id: id,
      });

      toast.success("Application approved");
      navigate("/admin/applications");
    } catch (error) {
      console.error("Error approving:", error);
      toast.error("Failed to approve application");
    }
  };

  const handleDecline = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("applications")
        .update({
          status: "declined",
          declined_by: user?.id,
          declined_at: new Date().toISOString(),
          internal_notes: internalNotes,
        })
        .eq("id", id);

      if (error) throw error;

      await supabase.from("activity_logs").insert({
        user_id: user?.id,
        action: "decline_application",
        entity_type: "application",
        entity_id: id,
      });

      toast.success("Application declined");
      navigate("/admin/applications");
    } catch (error) {
      console.error("Error declining:", error);
      toast.error("Failed to decline application");
    }
  };

  const saveNotes = async () => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ internal_notes: internalNotes })
        .eq("id", id);

      if (error) throw error;
      toast.success("Notes saved");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!application) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Application not found</p>
          <Button onClick={() => navigate("/admin/applications")} className="mt-4">
            Back to Applications
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "declined":
        return "text-red-600 bg-red-50 border-red-200";
      case "refunded":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/applications")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{application.applicant_name}</h1>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  application.status
                )}`}
              >
                {application.status.toUpperCase()}
              </span>
            </div>
          </div>
          {application.status === "pending" && (
            <div className="flex gap-2">
              <Button variant="outline" className="text-green-600" onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button variant="outline" className="text-red-600" onClick={handleDecline}>
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-base">{application.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-base">{application.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="text-base">
                  {application.city}, {application.state}
                </p>
              </div>
              {application.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-base">{application.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment & Income */}
          <Card>
            <CardHeader>
              <CardTitle>Employment & Income</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Employment Type
                </label>
                <p className="text-base">{application.employment_type || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Monthly Income
                </label>
                <p className="text-base">
                  {application.monthly_income
                    ? `$${Number(application.monthly_income).toLocaleString()}`
                    : application.income_range || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rental Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Rental Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Desired Move-in Date
                </label>
                <p className="text-base">
                  {application.desired_move_in_date
                    ? new Date(application.desired_move_in_date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit Type</label>
                <p className="text-base">{application.unit_type || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bedrooms</label>
                <p className="text-base">{application.bedroom_count || "N/A"}</p>
              </div>
              {application.source && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Source</label>
                  <p className="text-base">{application.source}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applicant Notes */}
          {application.applicant_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Applicant Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base whitespace-pre-wrap">{application.applicant_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Internal Notes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Internal Notes (Admin Only)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add internal notes about this application..."
                rows={5}
              />
              <Button onClick={saveNotes}>Save Notes</Button>
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 border-l-4 border-blue-500 bg-blue-50">
                <span className="font-medium">Application Submitted</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(application.created_at).toLocaleString()}
                </span>
              </div>
              {application.approved_at && (
                <div className="flex justify-between items-center p-3 border-l-4 border-green-500 bg-green-50">
                  <span className="font-medium">Approved</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(application.approved_at).toLocaleString()}
                  </span>
                </div>
              )}
              {application.declined_at && (
                <div className="flex justify-between items-center p-3 border-l-4 border-red-500 bg-red-50">
                  <span className="font-medium">Declined</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(application.declined_at).toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
