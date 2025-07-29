import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Comments } from '../helpers/schema';

export const schema = z.object({
  postId: z.number().int().positive(),
  authorId: z.string().optional(),
  authorName: z.string().min(1, "Author name is required"),
  authorAvatar: z.string().url().optional().nullable(),
  content: z.string().min(1, "Comment content cannot be empty"),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Comments>;

export const postComment = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/comments`, {
    method: "POST",
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
    throw new Error((errorObject as { error: string })?.error || "Failed to post comment");
  }

  return superjson.parse<OutputType>(await result.text());
};