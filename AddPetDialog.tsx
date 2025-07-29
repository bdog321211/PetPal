import React from 'react';
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
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from './Form';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { PetTypeArrayValues } from '../helpers/schema';
import { addPetSchema } from '../endpoints/pets/add_POST.schema';
import { useAddPet } from '../helpers/usePetMutations';

interface AddPetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddPetDialog = ({ isOpen, onOpenChange }: AddPetDialogProps) => {
  const addPetMutation = useAddPet();

  const form = useForm({
    schema: addPetSchema,
    defaultValues: {
      name: '',
      type: 'dog',
      breed: '',
      age: undefined,
      weight: undefined,
      imageUrl: '',
      description: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof addPetSchema>) => {
    addPetMutation.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        form.setValues({
          name: '',
          type: 'dog',
          breed: '',
          age: undefined,
          weight: undefined,
          imageUrl: '',
          description: '',
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Pet</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new member to your pet family.
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
                <Button type="button" variant="ghost" disabled={addPetMutation.isPending}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={addPetMutation.isPending}>
                {addPetMutation.isPending ? 'Adding...' : 'Add Pet'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};