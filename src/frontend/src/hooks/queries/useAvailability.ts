import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Availability } from '../../backend';

export function useGetAvailability(businessId: string, staffId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Availability | null>({
    queryKey: ['availability', businessId, staffId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAvailability(businessId, staffId);
    },
    enabled: !!actor && !actorFetching && !!businessId && !!staffId,
  });
}

export function useSetAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, staffId, availability }: { businessId: string; staffId: string; availability: Availability }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAvailability(businessId, staffId, availability);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['availability', variables.businessId, variables.staffId] });
    },
  });
}
