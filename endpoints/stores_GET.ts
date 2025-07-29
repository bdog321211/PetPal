import { db } from "../helpers/db";
import { schema, OutputType } from "./stores_GET.schema";
import superjson from 'superjson';
import { URL } from 'url';

export async function handle(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const { category, minRating, priceRange } = schema.parse(queryParams);

    let query = db.selectFrom('stores').selectAll();

    if (category) {
      query = query.where('category', '=', category);
    }

    if (minRating !== undefined) {
      query = query.where('rating', '>=', minRating.toString());
    }

    if (priceRange) {
      query = query.where('priceRange', '=', priceRange);
    }

    const stores = await query.orderBy('rating', 'desc').execute();

    return new Response(superjson.stringify(stores satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Failed to fetch stores:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}