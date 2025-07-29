import { z } from 'zod';
import superjson from 'superjson';

export const schema = z.object({
  postId: z.number().int().positive(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = { success: true } | { error: string; details?: string };

export const postPostsDelete = async (body: InputType, init?: RequestInit): Promise<{ success: true }> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/posts/delete`, {
    method: 'POST',
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error || 'Failed to delete post');
  }

  return superjson.parse(await result.text());
};