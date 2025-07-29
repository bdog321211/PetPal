import React, { useEffect } from 'react';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './Dialog';
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from './Form';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { PetTypeArrayValues, Pets } from '../helpers/schema';
import { updatePetSchema } from '../endpoints/pets/update_POST.schema';
import { useUpdatePet } from '../helpers/usePetMutations';
import type { Selectable } from 'kysely';

interface EditPetDialogProps {
  pet: Selectable<Pets>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPetDialog = ({ pet, isOpen, onOpenChange }: EditPetDialogProps) => {
  const updatePetMutation = useUpdatePet();

  const form = useForm({
    schema: updatePetSchema,
    defaultValues: {
      id: pet.id,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      weight: typeof pet.weight === 'string' ? parseFloat(pet.weight) : pet.weight,
      imageUrl: pet.imageUrl,
      description: pet.description,
    },
  });

  useEffect(() => {
    if (pet) {
      form.setValues({
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        weight: typeof pet.weight === 'string' ? parseFloat(pet.weight) : pet.weight,
        imageUrl: pet.imageUrl,
        description: pet.description,
      });
    }
  }, [pet, form.setValues]);

  const handleSubmit = (values: z.infer<typeof updatePetSchema>) => {
    updatePetMutation.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {pet.name}</DialogTitle>
          <DialogDescription>
            Update the details for your pet.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormItem name="name">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Buddy"
                  value={form.values.name}
                  onChange={(e) => form.setValues(prev => ({ ...prev, name: e.target.value }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
              <FormItem name="type">
                <FormLabel>Type</FormLabel>
                <Select
                  value={form.values.type}
                  onValueChange={(value) => form.setValues(prev => ({ ...prev, type: value as any }))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PetTypeArrayValues.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

              <FormItem name="age">
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    value={form.values.age ?? ''}
                    onChange={(e) => form.setValues(prev => ({ ...prev, age: e.target.value === '' ? undefined : e.target.valueAsNumber }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
              <FormItem name="breed">
                <FormLabel>Breed</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Golden Retriever"
                    value={form.values.breed ?? ''}
                    onChange={(e) => form.setValues(prev => ({ ...prev, breed: e.target.value }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormItem name="weight">
                <FormLabel>Weight (lbs)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 65"
                    value={form.values.weight ?? ''}
                    onChange={(e) => form.setValues(prev => ({ ...prev, weight: e.target.value === '' ? undefined : e.target.valueAsNumber }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <FormItem name="imageUrl">
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/image.png"
                  value={form.values.imageUrl ?? ''}
                  onChange={(e) => form.setValues(prev => ({ ...prev, imageUrl: e.target.value }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="description">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little about your pet"
                  value={form.values.description ?? ''}
                  onChange={(e) => form.setValues(prev => ({ ...prev, description: e.target.value }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost" disabled={updatePetMutation.isPending}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={updatePetMutation.isPending}>
                {updatePetMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};