import { db } from '../../helpers/db';
import { schema, OutputType } from './profile_GET.schema';
import superjson from 'superjson';

export async function handle(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = url.searchParams;
    const rawUserId = queryParams.get('userId');

    if (!rawUserId) {
      return new Response(superjson.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    const userId = parseInt(rawUserId, 10);
    if (isNaN(userId)) {
      return new Response(superjson.stringify({ error: 'Invalid User ID format' }), { status: 400 });
    }

    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      return new Response(superjson.stringify({ error: 'User not found' }), { status: 404 });
    }

    // The ownerId is a string, so we convert the numeric userId to a string for the query.
    const ownerId = String(user.id);

    const pets = await db
      .selectFrom('pets')
      .selectAll()
      .where('ownerId', '=', ownerId)
      .orderBy('createdAt', 'desc')
      .execute();

    const posts = await db
      .selectFrom('petPosts')
      .selectAll()
      .where('ownerId', '=', ownerId)
      .orderBy('createdAt', 'desc')
      .execute();

    const responseData: OutputType = {
      user,
      pets,
      posts,
    };

    return new Response(superjson.stringify(responseData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred';
    return new Response(superjson.stringify({ error: errorMessage }), { status: 500 });
  }
}