import { db } from "../helpers/db";
import { schema, OutputType } from "./likes_GET.schema";
import superjson from 'superjson';
import { URL } from 'url';

export async function handle(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = {
      postId: url.searchParams.get('postId'),
    };

    const validatedInput = schema.parse(queryParams);

    const likes = await db
      .selectFrom('likes')
      .where('postId', '=', validatedInput.postId)
      .orderBy('createdAt', 'asc')
      .selectAll()
      .execute();

    return new Response(superjson.stringify(likes satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Failed to fetch likes:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}