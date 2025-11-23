import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Shield, User } from "lucide-react";
import { toast } from "sonner";

export default function AdminTeam() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  useEffect(() => {
    loadTeamMembers();
    getCurrentUserRole();
  }, []);

  const getCurrentUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setCurrentUserRole(data.role);
      }
    } catch (error) {
      console.error("Error getting current user role:", error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error("Error loading team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      owner: "bg-purple-100 text-purple-800 border-purple-200",
      admin: "bg-blue-100 text-blue-800 border-blue-200",
      staff: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          styles[role as keyof typeof styles]
        }`}
      >
        {role.toUpperCase()}
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

  const isOwner = currentUserRole === "owner";

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">Manage your Rent EZ admin team</p>
          </div>
          {isOwner && (
            <Button disabled>
              <User className="h-4 w-4 mr-2" />
              Invite Team Member (Coming Soon)
            </Button>
          )}
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
              <Shield className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Owners/Admins</CardTitle>
              <Shield className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.filter((m) => m.role === "owner" || m.role === "admin").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
              <User className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.filter((m) => m.role === "staff").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date Added</TableHead>
                  {isOwner && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.profiles?.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{member.profiles?.email || "N/A"}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString()}
                    </TableCell>
                    {isOwner && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled>
                          Manage
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {teamMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No team members yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Descriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  {getRoleBadge("owner")}
                  <h3 className="font-semibold">Owner</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Full control over all aspects of the admin dashboard, including team
                  management, settings, and all application operations.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  {getRoleBadge("admin")}
                  <h3 className="font-semibold">Admin</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Full access to application management, payments, and analytics. Cannot
                  manage team members or change global settings.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  {getRoleBadge("staff")}
                  <h3 className="font-semibold">Staff</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Can view and manage applications, but cannot access payments, analytics, or
                  settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
