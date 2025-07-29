import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Sitters } from '../helpers/schema';

export const schema = z.object({
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  available: z.preprocess((val) => val === 'true', z.boolean()).optional(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Sitters>[];

export const getSitters = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(params);
  const queryParams = new URLSearchParams();

  if (validatedInput.minRating !== undefined) {
    queryParams.append('minRating', validatedInput.minRating.toString());
  }
  if (validatedInput.maxPrice !== undefined) {
    queryParams.append('maxPrice', validatedInput.maxPrice.toString());
  }
  if (validatedInput.available !== undefined) {
    queryParams.append('available', validatedInput.available.toString());
  }

  const response = await fetch(`/_api/sitters?${queryParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorObject = superjson.parse(await response.text());
        throw new Error((errorObject as any)?.error || "Failed to fetch sitters");
  }

  return superjson.parse<OutputType>(await response.text());
};