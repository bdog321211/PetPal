import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { UserSubscriptions, SubscriptionPlans } from '../../helpers/schema';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = (Selectable<UserSubscriptions> & {
  planName: Selectable<SubscriptionPlans>['name'];
  planPrice: Selectable<SubscriptionPlans>['price'];
  planFeatures: Selectable<SubscriptionPlans>['features'];
}) | null;

export const getUserSubscription = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/subscriptions/user`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    // 401 is a valid state for a non-logged-in user, so we don't throw
    if (result.status === 401) {
      return null;
    }
    const errorObject = superjson.parse(await result.text());
    throw new Error((errorObject as { error: string })?.error || "Failed to fetch user subscription");
  }

  // Handle empty response body for no subscription
  const text = await result.text();
  if (!text) {
    return null;
  }

  return superjson.parse<OutputType>(text);
};