import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema, OutputType } from './delete_POST.schema';
import { NotAuthenticatedError } from '../../helpers/getSetServerSession';
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const json = superjson.parse(await request.text());
    const { postId } = schema.parse(json);

    const result = await db
      .deleteFrom('petPosts')
      .where('id', '=', postId)
      .where('ownerId', '=', String(user.id)) // Ensure user can only delete their own post
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return new Response(
        superjson.stringify({ error: 'Post not found or you do not have permission to delete it.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      superjson.stringify({ success: true } satisfies OutputType),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return new Response(
        superjson.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.error('Error deleting post:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      superjson.stringify({ error: 'Failed to delete post.', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}