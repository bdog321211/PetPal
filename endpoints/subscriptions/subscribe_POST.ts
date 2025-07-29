import { db } from "../../helpers/db";
import { schema, OutputType } from "./subscribe_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import superjson from "superjson";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";
import { Kysely, sql } from "kysely";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const { planId } = schema.parse(json);

    // Mock payment processing
    console.log(`Simulating payment for user ${user.id} for plan ${planId}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    const paymentReference = `MOCK_PAY_${Date.now()}`;
    console.log(`Payment successful with reference: ${paymentReference}`);

    const plan = await db
      .selectFrom("subscriptionPlans")
      .select(["durationMonths"])
      .where("id", "=", planId)
      .executeTakeFirst();

    if (!plan) {
      return new Response(
        superjson.stringify({ error: "Subscription plan not found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const newSubscription = await db
      .insertInto("userSubscriptions")
      .values({
        userId: user.id,
        planId: planId,
        startDate: startDate,
        endDate: endDate,
        status: "active",
        autoRenew: true,
        paymentReference: paymentReference,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(newSubscription satisfies OutputType), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return new Response(
        superjson.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    console.error("Error subscribing user:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: "Failed to create subscription.", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}