import { db } from "../../helpers/db";
import { OutputType } from "./user_GET.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import superjson from "superjson";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const userSubscription = await db
      .selectFrom("userSubscriptions")
      .innerJoin("subscriptionPlans", "userSubscriptions.planId", "subscriptionPlans.id")
      .where("userSubscriptions.userId", "=", user.id)
      .where("userSubscriptions.status", "=", "active")
      .select([
        "userSubscriptions.id",
        "userSubscriptions.userId",
        "userSubscriptions.planId",
        "userSubscriptions.startDate",
        "userSubscriptions.endDate",
        "userSubscriptions.status",
        "userSubscriptions.autoRenew",
        "subscriptionPlans.name as planName",
        "subscriptionPlans.price as planPrice",
        "subscriptionPlans.features as planFeatures",
      ])
      .orderBy("userSubscriptions.endDate", "desc")
      .limit(1)
      .executeTakeFirst();

    return new Response(superjson.stringify(userSubscription ?? null), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return new Response(
        superjson.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    console.error("Error fetching user subscription:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: "Failed to fetch user subscription.", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}