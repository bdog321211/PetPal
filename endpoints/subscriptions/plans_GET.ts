import { db } from "../../helpers/db";
import { OutputType } from "./plans_GET.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const plans = await db
      .selectFrom("subscriptionPlans")
      .where("isActive", "=", true)
      .orderBy("price", "asc")
      .selectAll()
      .execute();

    return new Response(superjson.stringify(plans satisfies OutputType), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: "Failed to fetch subscription plans.", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}