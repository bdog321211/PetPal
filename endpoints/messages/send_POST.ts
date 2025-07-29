import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema, InputType, OutputType } from './send_POST.schema';
import superjson from 'superjson';
import { Transaction } from 'kysely';
import { DB } from '../../helpers/schema';

async function findOrCreateConversation(trx: Transaction<DB>, senderId: number, recipientId: number): Promise<number> {
  // Order IDs to ensure uniqueness regardless of who starts the conversation
  const [p1, p2] = [senderId, recipientId].sort((a, b) => a - b);

  let conversation = await trx
    .selectFrom('conversations')
    .select('id')
    .where('participant1Id', '=', p1)
    .where('participant2Id', '=', p2)
    .executeTakeFirst();

  if (conversation) {
    return conversation.id;
  }

  const newConversation = await trx
    .insertInto('conversations')
    .values({
      participant1Id: p1,
      participant2Id: p2,
      lastMessageAt: new Date(),
    })
    .returning('id')
    .executeTakeFirstOrThrow();
    
  return newConversation.id;
}

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    if (user.id === input.recipientId) {
      return Response.json(superjson.stringify({ error: 'Cannot send a message to yourself' }), { status: 400 });
    }

    const newMessage = await db.transaction().execute(async (trx) => {
      const conversationId = await findOrCreateConversation(trx, user.id, input.recipientId);

      const insertedMessage = await trx
        .insertInto('messages')
        .values({
          senderId: user.id,
          recipientId: input.recipientId,
          content: input.content,
          isRead: false,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      await trx
        .updateTable('conversations')
        .set({ lastMessageAt: insertedMessage.createdAt })
        .where('id', '=', conversationId)
        .execute();

      return insertedMessage;
    });

    return Response.json(superjson.stringify(newMessage satisfies OutputType));
  } catch (error) {
    console.error('Failed to send message:', error);
    if (error instanceof Error && error.message.includes("Not authenticated")) {
        return Response.json(superjson.stringify({ error: 'Authentication required' }), { status: 401 });
    }
    return Response.json(superjson.stringify({ error: 'Failed to send message' }), { status: 500 });
  }
}