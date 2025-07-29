import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Pets } from '../../helpers/schema';
import { addPetSchema } from './add_POST.schema';

export const updatePetSchema = addPetSchema.partial().extend({
  id: z.number().int().positive(),
});

export const schema = updatePetSchema;

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Pets>;

export const postUpdatePet = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/pets/update`, {
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
    throw new Error((errorObject as { error: string })?.error || "Failed to update pet");
  }

  return superjson.parse<OutputType>(await result.text());
};