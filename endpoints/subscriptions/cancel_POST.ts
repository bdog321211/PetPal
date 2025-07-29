import { db } from "../../helpers/db";
import { schema, OutputType } from "./cancel_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import superjson from "superjson";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const { userSubscriptionId } = schema.parse(json);

    const updatedSubscription = await db
      .updateTable("userSubscriptions")
      .set({
        status: "canceled",
        autoRenew: false,
        updatedAt: new Date(),
      })
      .where("id", "=", userSubscriptionId)
      .where("userId", "=", user.id) // Ensure user can only cancel their own subscription
      .returningAll()
      .executeTakeFirst();

    if (!updatedSubscription) {
      return new Response(
        superjson.stringify({ error: "Subscription not found or you do not have permission to cancel it." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(superjson.stringify(updatedSubscription satisfies OutputType), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return new Response(
        superjson.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    console.error("Error canceling subscription:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: "Failed to cancel subscription.", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}