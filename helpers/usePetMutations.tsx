import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { postAddPet, InputType as AddPetInput } from '../endpoints/pets/add_POST.schema';
import { postUpdatePet, InputType as UpdatePetInput } from '../endpoints/pets/update_POST.schema';

export const useAddPet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPet: AddPetInput) => postAddPet(newPet),
    onSuccess: () => {
      toast.success('Pet added successfully!');
      // Invalidate queries that fetch lists of pets to show the new one
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
    onError: (error) => {
      toast.error(`Failed to add pet: ${error.message}`);
    },
  });
};

export const useUpdatePet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (petData: UpdatePetInput) => postUpdatePet(petData),
    onSuccess: (updatedPet) => {
      toast.success('Pet updated successfully!');
      // Invalidate general pet lists
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      // Optionally, update the specific pet's query data if you have one
      queryClient.setQueryData(['pet', updatedPet.id], updatedPet);
    },
    onError: (error) => {
      toast.error(`Failed to update pet: ${error.message}`);
    },
  });
};