import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema, OutputType } from './conversation_GET.schema';
import superjson from 'superjson';

const MESSAGES_PER_PAGE = 30;

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const { searchParams } = new URL(request.url);
    const input = schema.parse({
      conversationId: Number(searchParams.get('conversationId')),
      cursor: searchParams.get('cursor') ? new Date(searchParams.get('cursor') as string) : undefined,
    });

    // Verify user is part of the conversation
    const conversation = await db
      .selectFrom('conversations')
      .selectAll()
      .where('id', '=', input.conversationId)
      .where((eb) => eb.or([
        eb('participant1Id', '=', user.id),
        eb('participant2Id', '=', user.id)
      ]))
      .executeTakeFirst();

    if (!conversation) {
      return Response.json(superjson.stringify({ error: 'Conversation not found or access denied' }), { status: 404 });
    }

    let query = db
      .selectFrom('messages')
      .selectAll()
      .where((eb) => eb.or([
        eb.and([
          eb('senderId', '=', conversation.participant1Id!),
          eb('recipientId', '=', conversation.participant2Id!)
        ]),
        eb.and([
          eb('senderId', '=', conversation.participant2Id!),
          eb('recipientId', '=', conversation.participant1Id!)
        ])
      ]))
      .orderBy('createdAt', 'desc')
      .limit(MESSAGES_PER_PAGE);

    if (input.cursor) {
      query = query.where('createdAt', '<', input.cursor);
    }

    const messages = await query.execute();

    // Mark messages as read
    await db.updateTable('messages')
      .set({ isRead: true })
      .where('recipientId', '=', user.id)
      .where('isRead', '=', false)
      .where((eb) => eb.or([
        eb.and([
          eb('senderId', '=', conversation.participant1Id!),
          eb('recipientId', '=', conversation.participant2Id!)
        ]),
        eb.and([
          eb('senderId', '=', conversation.participant2Id!),
          eb('recipientId', '=', conversation.participant1Id!)
        ])
      ]))
      .execute();

    let nextCursor: Date | null = null;
    if (messages.length === MESSAGES_PER_PAGE) {
      nextCursor = messages[MESSAGES_PER_PAGE - 1].createdAt;
    }

    const response: OutputType = {
      messages: messages.reverse(), // Oldest first for UI
      nextCursor,
    };

    return Response.json(superjson.stringify(response));
  } catch (error) {
    console.error('Failed to get conversation messages:', error);
    if (error instanceof Error && error.message.includes("Not authenticated")) {
        return Response.json(superjson.stringify({ error: 'Authentication required' }), { status: 401 });
    }
    return Response.json(superjson.stringify({ error: 'Failed to fetch messages' }), { status: 500 });
  }
}