import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { BusinessProfile } from '../../backend';

export function useGetBusiness(businessId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BusinessProfile | null>({
    queryKey: ['business', businessId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBusiness(businessId);
    },
    enabled: !!actor && !actorFetching && !!businessId,
  });
}

export function useCreateBusiness() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, name, timeZone }: { businessId: string; name: string; timeZone: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBusiness(businessId, name, timeZone);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business', variables.businessId] });
    },
  });
}
