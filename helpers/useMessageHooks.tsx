import { useMutation, useQueryClient, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { postMessageSend, InputType as MessageSendInput } from '../endpoints/messages/send_POST.schema';
import { getConversations } from '../endpoints/messages/conversations_GET.schema';
import { getConversation, InputType as ConversationInput } from '../endpoints/messages/conversation_GET.schema';
import { toast } from 'sonner';

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
  });
};

export const useConversationMessages = (conversationId: number) => {
  return useInfiniteQuery({
    queryKey: ['conversation', conversationId],
    queryFn: ({ pageParam }: { pageParam: Date | undefined }) => 
      getConversation({ conversationId, cursor: pageParam }),
    initialPageParam: undefined as Date | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newMessage: MessageSendInput) => postMessageSend(newMessage),
    onSuccess: (data) => {
      // Invalidate conversations to show the new message on top
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Invalidate all conversation messages since we don't have conversationId in message response
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });
};