import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Pets } from '../helpers/schema';

export const schema = z.object({
  ownerId: z.string().optional(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Pets>[];

export const getPets = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(params);
  const queryParams = new URLSearchParams();
  
  if (validatedInput.ownerId) {
    queryParams.append('ownerId', validatedInput.ownerId);
  }

  const response = await fetch(`/_api/pets?${queryParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorObject = superjson.parse(await response.text());
        throw new Error((errorObject as any)?.error || "Failed to fetch pets");
  }

  return superjson.parse<OutputType>(await response.text());
};