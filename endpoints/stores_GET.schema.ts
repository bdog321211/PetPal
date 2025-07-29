import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Stores } from '../helpers/schema';
import { ServiceCategoryArrayValues } from '../helpers/schema';

export const schema = z.object({
  category: z.enum(ServiceCategoryArrayValues).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  priceRange: z.string().optional(), // Assuming priceRange is a string like '$', '$$', '$$$'
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Stores>[];

export const getStores = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(params);
  const queryParams = new URLSearchParams();

  if (validatedInput.category) {
    queryParams.append('category', validatedInput.category);
  }
  if (validatedInput.minRating !== undefined) {
    queryParams.append('minRating', validatedInput.minRating.toString());
  }
  if (validatedInput.priceRange) {
    queryParams.append('priceRange', validatedInput.priceRange);
  }

  const response = await fetch(`/_api/stores?${queryParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorObject = superjson.parse(await response.text());
        throw new Error((errorObject as any)?.error || "Failed to fetch stores");
  }

  return superjson.parse<OutputType>(await response.text());
};