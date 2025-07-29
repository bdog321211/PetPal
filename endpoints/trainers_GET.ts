import { db } from "../helpers/db";
import { schema, OutputType } from "./trainers_GET.schema";
import superjson from 'superjson';
import { URL } from 'url';

export async function handle(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const { minRating, maxPrice, available } = schema.parse(queryParams);

    let query = db.selectFrom('trainers').selectAll();

    if (minRating !== undefined) {
      query = query.where('rating', '>=', minRating.toString());
    }

    if (maxPrice !== undefined) {
      query = query.where('hourlyRate', '<=', maxPrice.toString());
    }

    if (available !== undefined) {
      query = query.where('available', '=', available);
    }

    const trainers = await query.orderBy('rating', 'desc').execute();

    return new Response(superjson.stringify(trainers satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Failed to fetch trainers:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}