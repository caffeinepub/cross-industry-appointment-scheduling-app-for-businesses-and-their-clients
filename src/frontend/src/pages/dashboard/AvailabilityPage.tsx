import { useState, useEffect } from 'react';
import { useGetAvailability, useSetAvailability } from '../../hooks/queries/useAvailability';
import { useBusinessId } from '../../hooks/useBusinessId';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import type { Availability } from '../../backend';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export default function AvailabilityPage() {
  const businessId = useBusinessId();
  const staffId = 'default';
  const { data: availability } = useGetAvailability(businessId, staffId);
  const setAvailability = useSetAvailability();

  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>({
    0: { enabled: false, startTime: '09:00', endTime: '17:00' },
    1: { enabled: true, startTime: '09:00', endTime: '17:00' },
    2: { enabled: true, startTime: '09:00', endTime: '17:00' },
    3: { enabled: true, startTime: '09:00', endTime: '17:00' },
    4: { enabled: true, startTime: '09:00', endTime: '17:00' },
    5: { enabled: true, startTime: '09:00', endTime: '17:00' },
    6: { enabled: false, startTime: '09:00', endTime: '17:00' },
  });

  useEffect(() => {
    if (availability) {
      const dayOfWeek = Number(availability.dayOfWeek);
      const startMinutes = Number(availability.startTime);
      const endMinutes = Number(availability.endTime);
      
      const startHours = Math.floor(startMinutes / 60);
      const startMins = startMinutes % 60;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;

      setSchedule((prev) => ({
        ...prev,
        [dayOfWeek]: {
          enabled: true,
          startTime: `${String(startHours).padStart(2, '0')}:${String(startMins).padStart(2, '0')}`,
          endTime: `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`,
        },
      }));
    }
  }, [availability]);

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleSave = async () => {
    try {
      for (const day of DAYS) {
        const daySchedule = schedule[day.value];
        if (daySchedule.enabled) {
          const avail: Availability = {
            dayOfWeek: BigInt(day.value),
            startTime: BigInt(timeToMinutes(daySchedule.startTime)),
            endTime: BigInt(timeToMinutes(daySchedule.endTime)),
          };
          await setAvailability.mutateAsync({ businessId, staffId, availability: avail });
        }
      }
      toast.success('Availability updated successfully');
    } catch (error: any) {
      console.error('Save availability error:', error);
      toast.error(error.message || 'Failed to update availability');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>
            Set your weekly availability for client bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {DAYS.map((day) => {
            const daySchedule = schedule[day.value];
            return (
              <div key={day.value} className="flex items-center gap-4 pb-4 border-b last:border-0">
                <div className="w-32">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={daySchedule.enabled}
                      onCheckedChange={(checked) =>
                        setSchedule((prev) => ({
                          ...prev,
                          [day.value]: { ...prev[day.value], enabled: checked },
                        }))
                      }
                    />
                    <Label className="font-medium">{day.label}</Label>
                  </div>
                </div>
                {daySchedule.enabled ? (
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">From</Label>
                      <Input
                        type="time"
                        value={daySchedule.startTime}
                        onChange={(e) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [day.value]: { ...prev[day.value], startTime: e.target.value },
                          }))
                        }
                        className="w-32"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">To</Label>
                      <Input
                        type="time"
                        value={daySchedule.endTime}
                        onChange={(e) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [day.value]: { ...prev[day.value], endTime: e.target.value },
                          }))
                        }
                        className="w-32"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Closed</span>
                )}
              </div>
            );
          })}
          <Button onClick={handleSave} disabled={setAvailability.isPending} className="w-full">
            {setAvailability.isPending ? 'Saving...' : 'Save Availability'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
