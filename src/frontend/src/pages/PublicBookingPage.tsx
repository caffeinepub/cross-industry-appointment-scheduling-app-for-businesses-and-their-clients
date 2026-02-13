import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetBusiness } from '../hooks/queries/useBusinessProfile';
import { useGetAllServices } from '../hooks/queries/useServices';
import { useBookPublic } from '../hooks/queries/useAppointments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { PublicBookingRequest } from '../backend';

export default function PublicBookingPage() {
  const { businessId } = useParams({ from: '/book/$businessId' });
  const { data: business, isLoading: businessLoading } = useGetBusiness(businessId);
  const { data: services = [], isLoading: servicesLoading } = useGetAllServices(businessId);
  const bookPublic = useBookPublic();

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedServiceId || !selectedDate || !selectedTime || !clientName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const dateTime = new Date(`${selectedDate}T${selectedTime}`);
    const startTime = BigInt(dateTime.getTime() * 1_000_000);

    const request: PublicBookingRequest = {
      serviceId: selectedServiceId,
      startTime,
      name: clientName.trim(),
      phone: clientPhone.trim() || undefined,
      email: clientEmail.trim() || undefined,
    };

    try {
      await bookPublic.mutateAsync({ businessId, request });
      setIsBooked(true);
      toast.success('Appointment booked successfully!');
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to book appointment');
    }
  };

  if (businessLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Business Not Found</CardTitle>
            <CardDescription>The booking page you're looking for doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isBooked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-fit">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your appointment has been successfully booked with {business.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                You will receive a confirmation shortly. If you have any questions, please contact the business directly.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsBooked(false);
                setSelectedServiceId('');
                setSelectedDate('');
                setSelectedTime('');
                setClientName('');
                setClientPhone('');
                setClientEmail('');
              }}
            >
              Book Another Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
          <p className="text-muted-foreground">Book an appointment</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Your Appointment</CardTitle>
            <CardDescription>Fill in the details below to book your appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="service">Select Service *</Label>
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex items-center justify-between gap-4">
                          <span>{service.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {service.durationMinutes.toString()} min
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedService && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Clock className="h-4 w-4" />
                    Duration: {selectedService.durationMinutes.toString()} minutes
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Your Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Full Name *</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Phone (optional)</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email (optional)</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={bookPublic.isPending}>
                {bookPublic.isPending ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
