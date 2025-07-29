import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { SubscriptionPlans } from '../../helpers/schema';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<SubscriptionPlans>[];

export const getSubscriptionPlans = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/subscriptions/plans`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
    throw new Error((errorObject as { error: string })?.error || "Failed to fetch subscription plans");
  }

  return superjson.parse<OutputType>(await result.text());
};