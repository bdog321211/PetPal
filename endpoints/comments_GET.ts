import { db } from "../helpers/db";
import { schema, OutputType } from "./comments_GET.schema";
import superjson from 'superjson';
import { URL } from 'url';

export async function handle(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = {
      postId: url.searchParams.get('postId'),
    };

    const validatedInput = schema.parse(queryParams);

    const comments = await db
      .selectFrom('comments')
      .where('postId', '=', validatedInput.postId)
      .orderBy('createdAt', 'asc')
      .selectAll()
      .execute();

    return new Response(superjson.stringify(comments satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}