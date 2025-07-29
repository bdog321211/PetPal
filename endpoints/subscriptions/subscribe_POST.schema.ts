import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { UserSubscriptions } from '../../helpers/schema';

export const schema = z.object({
  planId: z.number().int().positive(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<UserSubscriptions>;

export const postSubscribe = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/subscriptions/subscribe`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
    throw new Error((errorObject as { error: string })?.error || "Failed to subscribe");
  }

  return superjson.parse<OutputType>(await result.text());
};