import { z } from 'zod';
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Conversations, Users, Messages } from '../../helpers/schema';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type ConversationPreview = {
  conversationId: Selectable<Conversations>['id'];
  otherParticipant: {
    id: Selectable<Users>['id'];
    displayName: Selectable<Users>['displayName'];
    avatarUrl: Selectable<Users>['avatarUrl'];
  };
  lastMessageContent: Selectable<Messages>['content'] | null;
  lastMessageAt: Selectable<Conversations>['lastMessageAt'];
  lastMessageSenderId: Selectable<Messages>['senderId'] | null;
};

export type OutputType = ConversationPreview[];

export const getConversations = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/messages/conversations`, {
    method: 'GET',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.json());
    throw new Error((errorObject as { error: string })?.error || 'Failed to fetch conversations');
  }

  return superjson.parse<OutputType>(await result.json());
};