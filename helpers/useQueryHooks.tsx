import { useQuery } from '@tanstack/react-query';
import { getPets, InputType as PetsInput } from '../endpoints/pets_GET.schema';
import { getSitters, InputType as SittersInput } from '../endpoints/sitters_GET.schema';
import { getStores, InputType as StoresInput } from '../endpoints/stores_GET.schema';
import { getTrainers, InputType as TrainersInput } from '../endpoints/trainers_GET.schema';
import { getPetPosts, InputType as PetPostsInput } from '../endpoints/pet-posts_GET.schema';
import { getComments, InputType as CommentsInput } from '../endpoints/comments_GET.schema';
import { getLikes, InputType as LikesInput } from '../endpoints/likes_GET.schema';


export const usePets = (params: PetsInput = {}) => {
  return useQuery({
    queryKey: ['pets', params],
    queryFn: () => getPets(params),
  });
};

export const useSitters = (params: SittersInput = {}) => {
  return useQuery({
    queryKey: ['sitters', params],
    queryFn: () => getSitters(params),
  });
};

export const useStores = (params: StoresInput = {}) => {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: () => getStores(params),
  });
};

export const useTrainers = (params: TrainersInput = {}) => {
  return useQuery({
    queryKey: ['trainers', params],
    queryFn: () => getTrainers(params),
  });
};

export const usePetPosts = (params: PetPostsInput) => {
  return useQuery({
    queryKey: ['pet-posts', params],
    queryFn: () => getPetPosts(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useComments = (params: CommentsInput) => {
  return useQuery({
    queryKey: ['comments', params],
    queryFn: () => getComments(params),
    enabled: !!params.postId, // Only run query if postId is provided
  });
};

export const useLikes = (params: LikesInput) => {
  return useQuery({
    queryKey: ['likes', params],
    queryFn: () => getLikes(params),
    enabled: !!params.postId, // Only run query if postId is provided
  });
};

