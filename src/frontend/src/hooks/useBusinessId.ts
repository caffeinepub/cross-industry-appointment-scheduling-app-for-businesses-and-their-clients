import { useInternetIdentity } from './useInternetIdentity';

export function useBusinessId(): string {
  const { identity } = useInternetIdentity();
  
  if (!identity) {
    return '';
  }

  return `biz-${identity.getPrincipal().toString().slice(0, 10)}`;
}
