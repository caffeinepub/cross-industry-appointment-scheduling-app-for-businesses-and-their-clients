import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Service } from '../../backend';

export function useGetAllServices(businessId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ['services', businessId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices(businessId);
    },
    enabled: !!actor && !actorFetching && !!businessId,
  });
}

export function useAddService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, service }: { businessId: string; service: Service }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addService(businessId, service);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services', variables.businessId] });
    },
  });
}
