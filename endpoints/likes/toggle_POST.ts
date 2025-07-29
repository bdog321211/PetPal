import { db } from "../../helpers/db";
import { schema, InputType, OutputType } from "./toggle_POST.schema";
import superjson from 'superjson';
import { sql } from 'kysely';

export async function handle(request: Request): Promise<Response> {
  try {
    const json = await request.json();
    const validatedInput = schema.parse(json);
    const { postId, userId, userName } = validatedInput;

    const result = await db.transaction().execute(async (trx) => {
      const existingLike = await trx
        .selectFrom('likes')
        .where('postId', '=', postId)
        .where('userId', '=', userId)
        .select('id')
        .executeTakeFirst();

      if (existingLike) {
        // Unlike
        await trx
          .deleteFrom('likes')
          .where('id', '=', existingLike.id)
          .execute();
        
        await trx
          .updateTable('petPosts')
          .set((eb) => ({
            likesCount: eb('likesCount', '-', 1)
          }))
          .where('id', '=', postId)
          .execute();

        const updatedPost = await trx.selectFrom('petPosts').where('id', '=', postId).select('likesCount').executeTakeFirst();

        return { liked: false, likesCount: updatedPost?.likesCount ?? 0 };
      } else {
        // Like
        await trx
          .insertInto('likes')
          .values({ postId, userId, userName })
          .execute();

        await trx
          .updateTable('petPosts')
          .set((eb) => ({
            likesCount: eb('likesCount', '+', 1)
          }))
          .where('id', '=', postId)
          .execute();
        
        const updatedPost = await trx.selectFrom('petPosts').where('id', '=', postId).select('likesCount').executeTakeFirst();

        return { liked: true, likesCount: updatedPost?.likesCount ?? 0 };
      }
    });

    return new Response(superjson.stringify(result satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Failed to toggle like:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}