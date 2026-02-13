import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Appointment, PublicBookingRequest } from '../../backend';

export function useGetAllAppointments(businessId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['appointments', businessId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAppointments(businessId);
    },
    enabled: !!actor && !actorFetching && !!businessId,
  });
}

export function useBookPublic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, request }: { businessId: string; request: PublicBookingRequest }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookPublic(businessId, request);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.businessId] });
    },
  });
}
