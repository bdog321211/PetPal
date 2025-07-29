import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../endpoints/users/profile_GET.schema';

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile({ userId }),
    enabled: !!userId,
  });
};