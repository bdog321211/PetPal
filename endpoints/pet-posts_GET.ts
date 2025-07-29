import { db } from "../helpers/db";
import { schema, OutputType } from "./pet-posts_GET.schema";
import superjson from 'superjson';
import { URL } from 'url';

export async function handle(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const { limit, offset } = schema.parse(queryParams);

    let query = db.selectFrom('petPosts').selectAll();

    const posts = await query
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    return new Response(superjson.stringify(posts satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Failed to fetch pet posts:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}