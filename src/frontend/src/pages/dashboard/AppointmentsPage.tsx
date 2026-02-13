import { useGetAllAppointments } from '../../hooks/queries/useAppointments';
import { useGetAllServices } from '../../hooks/queries/useServices';
import { useGetAllClients } from '../../hooks/queries/useClients';
import { useBusinessId } from '../../hooks/useBusinessId';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { formatAppointmentDate, formatAppointmentTime } from '../../utils/dateTime';

export default function AppointmentsPage() {
  const businessId = useBusinessId();
  const { data: appointments = [], isLoading: appointmentsLoading } = useGetAllAppointments(businessId);
  const { data: services = [] } = useGetAllServices(businessId);
  const { data: clients = [] } = useGetAllClients(businessId);

  const getServiceName = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      scheduled: 'default',
      completed: 'secondary',
      canceled: 'destructive',
      noShow: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const upcomingAppointments = appointments.filter((apt) => apt.status === 'scheduled');

  if (appointmentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>View and manage your scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
              <p className="text-muted-foreground mb-4">
                Appointments will appear here once clients start booking
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingAppointments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 font-medium">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatAppointmentDate(appointment.startTime)}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {formatAppointmentTime(appointment.startTime)} - {formatAppointmentTime(appointment.endTime)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {getClientName(appointment.clientId)}
                            </div>
                          </TableCell>
                          <TableCell>{getServiceName(appointment.serviceId)}</TableCell>
                          <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {appointments.length > upcomingAppointments.length && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Past Appointments</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments
                        .filter((apt) => apt.status !== 'scheduled')
                        .map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 font-medium">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {formatAppointmentDate(appointment.startTime)}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  {formatAppointmentTime(appointment.startTime)} - {formatAppointmentTime(appointment.endTime)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {getClientName(appointment.clientId)}
                              </div>
                            </TableCell>
                            <TableCell>{getServiceName(appointment.serviceId)}</TableCell>
                            <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
