import { useState } from 'react';
import { useGetAllServices, useAddService } from '../../hooks/queries/useServices';
import { useBusinessId } from '../../hooks/useBusinessId';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';
import type { Service } from '../../backend';

export default function ServicesPage() {
  const businessId = useBusinessId();
  const { data: services = [], isLoading } = useGetAllServices(businessId);
  const addService = useAddService();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [duration, setDuration] = useState('30');

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceName.trim() || !duration) {
      toast.error('Please fill in all fields');
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      toast.error('Duration must be a positive number');
      return;
    }

    const newService: Service = {
      id: `service-${Date.now()}`,
      name: serviceName.trim(),
      durationMinutes: BigInt(durationNum),
    };

    try {
      await addService.mutateAsync({ businessId, service: newService });
      toast.success('Service added successfully');
      setIsDialogOpen(false);
      setServiceName('');
      setDuration('30');
    } catch (error: any) {
      console.error('Add service error:', error);
      toast.error(error.message || 'Failed to add service');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Services</CardTitle>
              <CardDescription>Manage the services you offer to clients</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddService}>
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                    <DialogDescription>
                      Create a new service that clients can book
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceName">Service Name *</Label>
                      <Input
                        id="serviceName"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="e.g., Haircut, Consultation"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="30"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addService.isPending}>
                      {addService.isPending ? 'Adding...' : 'Add Service'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first service to start accepting bookings
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {service.durationMinutes.toString()} min
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
