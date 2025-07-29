import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { PetPosts } from '../helpers/schema';

export const schema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<PetPosts>[];

export const getPetPosts = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(params);
  const queryParams = new URLSearchParams();

  queryParams.append('limit', validatedInput.limit.toString());
  queryParams.append('offset', validatedInput.offset.toString());

  const response = await fetch(`/_api/pet-posts?${queryParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorObject = superjson.parse(await response.text());
        throw new Error((errorObject as any)?.error || "Failed to fetch pet posts");
  }

  return superjson.parse<OutputType>(await response.text());
};