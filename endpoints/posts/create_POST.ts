import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema, OutputType } from './create_POST.schema';

import { NotAuthenticatedError } from '../../helpers/getSetServerSession';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (!user) {
      throw new NotAuthenticatedError();
    }

    const json = await request.json();
    const input = schema.parse(json);

    const [newPost] = await db
      .insertInto('petPosts')
      .values({
        ownerId: String(user.id),
        imageUrl: input.imageUrl,
        caption: input.caption,
        likesCount: 0,
        commentsCount: 0,
        petId: input.petId,
      })
      .returningAll()
      .execute();

    if (!newPost) {
      return Response.json({ error: 'Failed to create post.' }, { status: 500 });
    }

    return Response.json(newPost satisfies OutputType);
  } catch (error) {
    console.error('Error creating post:', error);
    if (error instanceof NotAuthenticatedError) {
      return Response.json({ error: 'You must be logged in to create a post.' }, { status: 401 });
    }
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}