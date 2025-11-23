import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminSettings() {
  const [companyName] = useState("Rent EZ");
  const [contactEmail, setContactEmail] = useState("support@rentez.com");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      toast.success("Settings saved successfully");
      setLoading(false);
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your Rent EZ admin dashboard settings</p>
        </div>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Support Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="support@rentez.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Stripe Integration</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ Stripe is connected and active
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="application-fee">Application Fee</Label>
              <Input
                id="application-fee"
                value="$20.00"
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                The application fee amount cannot be changed from the dashboard
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-email">Application Approved Email</Label>
              <Textarea
                id="approval-email"
                rows={4}
                placeholder="Template for approval emails..."
                defaultValue="Congratulations! Your Rent EZ application has been approved. Our team will contact you within 24 hours to connect you with rental specialists and landlords."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="decline-email">Application Declined Email</Label>
              <Textarea
                id="decline-email"
                rows={4}
                placeholder="Template for decline emails..."
                defaultValue="Thank you for your interest in Rent EZ. Unfortunately, we are unable to approve your application at this time. If you have questions, please contact our support team."
              />
            </div>
          </CardContent>
        </Card>

        {/* Default Options */}
        <Card>
          <CardHeader>
            <CardTitle>Default Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Application Status</Label>
              <Input value="Pending" disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Application Sources</Label>
              <Input
                placeholder="Facebook, Instagram, Website, Referral..."
                defaultValue="Facebook, Instagram, Website, Referral"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of traffic sources
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
