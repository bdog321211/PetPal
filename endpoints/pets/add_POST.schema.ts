import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Pets } from '../../helpers/schema';
import { PetTypeArrayValues } from '../../helpers/schema';

export const addPetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  type: z.enum(PetTypeArrayValues),
  breed: z.string().optional().nullable(),
  age: z.coerce.number().min(0, 'Age must be a positive number.').optional().nullable(),
  weight: z.coerce.number().min(0, 'Weight must be a positive number.').optional().nullable(),
  imageUrl: z.string().url('Please enter a valid image URL.').optional().nullable(),
  description: z.string().max(200, 'Description cannot exceed 200 characters.').optional().nullable(),
});

export const schema = addPetSchema;

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Pets>;

export const postAddPet = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/pets/add`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
    throw new Error((errorObject as { error: string })?.error || "Failed to add pet");
  }

  return superjson.parse<OutputType>(await result.text());
};