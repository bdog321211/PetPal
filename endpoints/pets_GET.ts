import { db } from "../helpers/db";
import { schema, OutputType } from "./pets_GET.schema";
import superjson from 'superjson';
import { URL } from 'url';

export async function handle(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const { ownerId } = schema.parse(queryParams);

    let query = db.selectFrom('pets').selectAll();

    if (ownerId) {
      query = query.where('ownerId', '=', ownerId);
    }

    const pets = await query.orderBy('createdAt', 'desc').execute();

    return new Response(superjson.stringify(pets satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Failed to fetch pets:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}