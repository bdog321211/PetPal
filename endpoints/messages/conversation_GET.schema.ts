import { z } from 'zod';
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Messages } from '../../helpers/schema';

export const schema = z.object({
  conversationId: z.number().int().positive(),
  cursor: z.date().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  messages: Selectable<Messages>[];
  nextCursor: Date | null;
};

export const getConversation = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  searchParams.set('conversationId', String(params.conversationId));
  if (params.cursor) {
    searchParams.set('cursor', params.cursor.toISOString());
  }

  const result = await fetch(`/_api/messages/conversation?${searchParams.toString()}`, {
    method: 'GET',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.json());
    throw new Error((errorObject as { error: string })?.error || 'Failed to fetch conversation');
  }

  return superjson.parse<OutputType>(await result.json());
};