import { db } from "../helpers/db";
import { schema, InputType, OutputType } from "./comments_POST.schema";
import superjson from 'superjson';
import { sql } from 'kysely';

export async function handle(request: Request): Promise<Response> {
  try {
    const json = await request.json();
    const validatedInput = schema.parse(json);

    const newComment = await db.transaction().execute(async (trx) => {
      const insertedComment = await trx
        .insertInto('comments')
        .values({
          postId: validatedInput.postId,
          authorId: validatedInput.authorId,
          authorName: validatedInput.authorName,
          authorAvatar: validatedInput.authorAvatar,
          content: validatedInput.content,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      await trx
        .updateTable('petPosts')
        .set((eb) => ({
          commentsCount: eb('commentsCount', '+', 1)
        }))
        .where('id', '=', validatedInput.postId)
        .execute();
      
      return insertedComment;
    });

    return new Response(superjson.stringify(newComment satisfies OutputType), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Failed to post comment:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}