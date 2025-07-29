import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Users, Pets, PetPosts } from '../../helpers/schema';

export const schema = z.object({
  userId: z.string(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  user: Selectable<Users>;
  pets: Selectable<Pets>[];
  posts: Selectable<PetPosts>[];
};

export const getUserProfile = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(params);
  const queryParams = new URLSearchParams();
  
  queryParams.append('userId', validatedInput.userId);

  const response = await fetch(`/_api/users/profile?${queryParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorObject = superjson.parse(await response.text());
    throw new Error((errorObject as { error: string })?.error || "Failed to fetch user profile");
  }

  return superjson.parse<OutputType>(await response.text());
};