import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  postId: z.number().int().positive(),
  userId: z.string().min(1, "User ID is required"),
  userName: z.string().min(1, "User name is required"),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  liked: boolean;
  likesCount: number;
};

export const postLikesToggle = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/likes/toggle`, {
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
    throw new Error((errorObject as { error: string })?.error || "Failed to toggle like");
  }

  return superjson.parse<OutputType>(await result.text());
};