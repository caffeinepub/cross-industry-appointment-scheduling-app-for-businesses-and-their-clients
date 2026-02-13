import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Client } from '../../backend';

export function useGetAllClients(businessId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Client[]>({
    queryKey: ['clients', businessId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClients(businessId);
    },
    enabled: !!actor && !actorFetching && !!businessId,
  });
}

export function useAddClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, client }: { businessId: string; client: Client }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addClient(businessId, client);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients', variables.businessId] });
    },
  });
}
