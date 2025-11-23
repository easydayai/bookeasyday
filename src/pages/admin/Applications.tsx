import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Download, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "approve" | "decline" | null;
    applicationId: string | null;
  }>({ open: false, action: null, applicationId: null });
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.applicant_name.toLowerCase().includes(term) ||
          app.email.toLowerCase().includes(term) ||
          app.phone.includes(term) ||
          app.city.toLowerCase().includes(term)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleApprove = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("applications")
        .update({
          status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user?.id,
        action: "approve_application",
        entity_type: "application",
        entity_id: id,
      });

      toast.success("Application approved");
      loadApplications();
    } catch (error) {
      console.error("Error approving application:", error);
      toast.error("Failed to approve application");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("applications")
        .update({
          status: "declined",
          declined_by: user?.id,
          declined_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user?.id,
        action: "decline_application",
        entity_type: "application",
        entity_id: id,
      });

      toast.success("Application declined");
      loadApplications();
    } catch (error) {
      console.error("Error declining application:", error);
      toast.error("Failed to decline application");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "City",
      "State",
      "Status",
      "Move-in Date",
      "Income",
      "Employment",
      "Created At",
    ];

    const rows = filteredApplications.map((app) => [
      app.applicant_name,
      app.email,
      app.phone,
      app.city,
      app.state,
      app.status,
      app.desired_move_in_date || "",
      app.monthly_income || "",
      app.employment_type || "",
      new Date(app.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-gray-100 text-gray-800 border-gray-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      declined: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-orange-100 text-orange-800 border-orange-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
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

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Applications</h1>
            <p className="text-muted-foreground">
              Manage and review all Rent EZ applications
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.applicant_name}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.phone}</TableCell>
                  <TableCell>
                    {app.city}, {app.state}
                  </TableCell>
                  <TableCell>
                    {app.monthly_income
                      ? `$${Number(app.monthly_income).toLocaleString()}`
                      : app.income_range || "N/A"}
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/admin/applications/${app.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {app.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                action: "approve",
                                applicationId: app.id,
                              })
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                action: "decline",
                                applicationId: app.id,
                              })
                            }
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredApplications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No applications found
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ open, action: null, applicationId: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "approve" ? "Approve" : "Decline"} Application?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmDialog.action} this application? This action
              will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.applicationId) {
                  if (confirmDialog.action === "approve") {
                    handleApprove(confirmDialog.applicationId);
                  } else {
                    handleDecline(confirmDialog.applicationId);
                  }
                }
                setConfirmDialog({ open: false, action: null, applicationId: null });
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
