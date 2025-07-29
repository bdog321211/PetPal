import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { OutputType } from './conversations_GET.schema';
import superjson from 'superjson';
import { sql } from 'kysely';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const conversations = await db
      .selectFrom('conversations as c')
      .select((eb) => [
        'c.id as conversationId',
        'c.lastMessageAt',
        // Use a subquery to get the last message content
        sql<string>`(
          SELECT content FROM messages m1
          WHERE (m1.sender_id = c.participant1_id AND m1.recipient_id = c.participant2_id)
             OR (m1.sender_id = c.participant2_id AND m1.recipient_id = c.participant1_id)
          ORDER BY m1.created_at DESC
          LIMIT 1
        )`.as('lastMessageContent'),
        // Use a subquery to get the last message sender
        sql<number>`(
          SELECT sender_id FROM messages m2
          WHERE (m2.sender_id = c.participant1_id AND m2.recipient_id = c.participant2_id)
             OR (m2.sender_id = c.participant2_id AND m2.recipient_id = c.participant1_id)
          ORDER BY m2.created_at DESC
          LIMIT 1
        )`.as('lastMessageSenderId'),
        // Determine the other participant's ID
        eb.case()
          .when('c.participant1Id', '=', user.id)
          .then(eb.ref('c.participant2Id'))
          .else(eb.ref('c.participant1Id'))
          .end().as('otherParticipantId'),
        // Get other participant's details
        sql<string>`(
          SELECT display_name FROM users
          WHERE id = (CASE WHEN c.participant1_id = ${user.id} THEN c.participant2_id ELSE c.participant1_id END)
        )`.as('otherParticipantDisplayName'),
        sql<string>`(
          SELECT avatar_url FROM users
          WHERE id = (CASE WHEN c.participant1_id = ${user.id} THEN c.participant2_id ELSE c.participant1_id END)
        )`.as('otherParticipantAvatarUrl'),
      ])
      .where((eb) => eb.or([
        eb('c.participant1Id', '=', user.id),
        eb('c.participant2Id', '=', user.id)
      ]))
      .orderBy('c.lastMessageAt', 'desc')
      .execute();

    const response: OutputType = conversations
      .filter(conv => conv.otherParticipantId !== null)
      .map(conv => ({
        conversationId: conv.conversationId,
        lastMessageAt: conv.lastMessageAt,
        lastMessageContent: conv.lastMessageContent || null,
        lastMessageSenderId: conv.lastMessageSenderId,
        otherParticipant: {
          id: conv.otherParticipantId!,
          displayName: conv.otherParticipantDisplayName,
          avatarUrl: conv.otherParticipantAvatarUrl,
        }
      }));

    return Response.json(superjson.stringify(response));
  } catch (error) {
    console.error('Failed to get conversations:', error);
    if (error instanceof Error && error.message.includes("Not authenticated")) {
        return Response.json(superjson.stringify({ error: 'Authentication required' }), { status: 401 });
    }
    return Response.json(superjson.stringify({ error: 'Failed to fetch conversations' }), { status: 500 });
  }
}