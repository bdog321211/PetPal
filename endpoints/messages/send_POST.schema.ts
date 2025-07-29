import { z } from 'zod';
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Messages } from '../../helpers/schema';

export const schema = z.object({
  recipientId: z.number().int().positive(),
  content: z.string().min(1, 'Message content cannot be empty').max(2000),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Messages>;

export const postMessageSend = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/messages/send`, {
    method: 'POST',
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.json());
    throw new Error((errorObject as { error: string })?.error || 'Failed to send message');
  }

  return superjson.parse<OutputType>(await result.json());
};