import { z } from 'zod';

import type { Selectable } from 'kysely';
import type { PetPosts } from '../../helpers/schema';

export const schema = z.object({
  imageUrl: z.string().url({ message: 'A valid image URL is required.' }),
  caption: z.string().max(2200, 'Caption is too long.').optional(),
  petId: z.number().int().positive().optional().nullable(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<PetPosts>;

export const postPostsCreate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/posts/create`, {
    method: 'POST',
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error((errorObject as { error: string })?.error || 'Failed to create post');
  }

  return await result.json() as OutputType;
};