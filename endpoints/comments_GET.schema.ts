import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Comments } from '../helpers/schema';

export const schema = z.object({
  postId: z.coerce.number().int().positive(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Comments>[];

export const getComments = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(params);
  const queryParams = new URLSearchParams();
  
  queryParams.append('postId', validatedInput.postId.toString());

  const response = await fetch(`/_api/comments?${queryParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorObject = superjson.parse(await response.text());
    throw new Error((errorObject as { error: string })?.error || "Failed to fetch comments");
  }

  return superjson.parse<OutputType>(await response.text());
};