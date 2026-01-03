import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, DollarSign, Clock } from 'lucide-react';
import { useBusiness, Service } from '@/hooks/useBusiness';
import { toast } from 'sonner';

interface ServiceFormData {
  name: string;
  duration_min: number;
  price_cents: number;
  payment_mode: 'none' | 'deposit_required' | 'pay_later' | 'after_service';
  deposit_type: 'none' | 'fixed' | 'percent';
  deposit_value: number;
  active: boolean;
}

const defaultFormData: ServiceFormData = {
  name: '',
  duration_min: 30,
  price_cents: 0,
  payment_mode: 'none',
  deposit_type: 'none',
  deposit_value: 0,
  active: true,
};

export function ServicesManager() {
  const { business, services, createService, updateService, deleteService } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateService(editingId, formData);
        toast.success('Service updated');
      } else {
        await createService({
          ...formData,
          business_id: business.id,
        });
        toast.success('Service created');
      }
      setIsOpen(false);
      setFormData(defaultFormData);
      setEditingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      duration_min: service.duration_min,
      price_cents: service.price_cents,
      payment_mode: service.payment_mode,
      deposit_type: service.deposit_type,
      deposit_value: service.deposit_value,
      active: service.active,
    });
    setEditingId(service.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      await deleteService(id);
      toast.success('Service deleted');
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getPaymentModeBadge = (mode: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      none: 'outline',
      deposit_required: 'default',
      pay_later: 'secondary',
      after_service: 'secondary',
    };
    const labels: Record<string, string> = {
      none: 'No Payment',
      deposit_required: 'Deposit Required',
      pay_later: 'Pay Later',
      after_service: 'Pay After',
    };
    return <Badge variant={variants[mode]}>{labels[mode]}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Services</CardTitle>
          <CardDescription>Manage your service offerings and payment settings</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setFormData(defaultFormData); setEditingId(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Service' : 'Add Service'}</DialogTitle>
              <DialogDescription>Configure your service details and payment options</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Initial Consultation"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    value={formData.duration_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_min: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={(formData.price_cents / 100).toFixed(2)}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_cents: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select
                  value={formData.payment_mode}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    payment_mode: value as ServiceFormData['payment_mode'],
                    deposit_type: value === 'deposit_required' ? 'fixed' : 'none',
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Payment Required</SelectItem>
                    <SelectItem value="deposit_required">Deposit Required at Booking</SelectItem>
                    <SelectItem value="pay_later">Pay Later (Invoice)</SelectItem>
                    <SelectItem value="after_service">Pay After Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.payment_mode === 'deposit_required' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Deposit Type</Label>
                    <Select
                      value={formData.deposit_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, deposit_type: value as 'fixed' | 'percent' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="percent">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{formData.deposit_type === 'percent' ? 'Deposit %' : 'Deposit $'}</Label>
                    <Input
                      type="number"
                      min="0"
                      max={formData.deposit_type === 'percent' ? 100 : undefined}
                      value={formData.deposit_type === 'percent' ? formData.deposit_value : (formData.deposit_value / 100).toFixed(2)}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deposit_value: formData.deposit_type === 'percent'
                          ? parseInt(e.target.value) || 0
                          : Math.round(parseFloat(e.target.value || '0') * 100)
                      }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No services yet. Add your first service to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{service.name}</span>
                    {!service.active && <Badge variant="outline">Inactive</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.duration_min} min
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatPrice(service.price_cents)}
                    </span>
                    {getPaymentModeBadge(service.payment_mode)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
