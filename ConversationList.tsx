import React from 'react';
import { useConversations } from '../helpers/useMessageHooks';
import { useAuth } from '../helpers/useAuth';
import { Skeleton } from './Skeleton';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import styles from './ConversationList.module.css';

interface ConversationListProps {
  selectedConversationId: number | null;
  onSelectConversation: (id: number) => void;
}

export const ConversationList = ({ selectedConversationId, onSelectConversation }: ConversationListProps) => {
  const { data: conversations, isLoading, error } = useConversations();
  const { authState } = useAuth();

  const renderSkeleton = () => (
    Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className={styles.item}>
        <Skeleton style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%' }} />
        <div className={styles.itemInfo}>
          <Skeleton style={{ width: '8rem', height: '1rem', marginBottom: '0.5rem' }} />
          <Skeleton style={{ width: '12rem', height: '0.8rem' }} />
        </div>
      </div>
    ))
  );

  if (isLoading || authState.type === 'loading') {
    return (
      <div className={styles.container}>
        <h2 className={styles.header}>Messages</h2>
        <div className={styles.list}>{renderSkeleton()}</div>
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>Error: {error.message}</div>;
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.header}>Messages</h2>
        <div className={styles.empty}>No conversations yet.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Messages</h2>
      <div className={styles.list}>
        {conversations.map((conv) => {
          const initials = conv.otherParticipant.displayName.split(' ').map(n => n[0]).join('').substring(0, 2);
          const isSelected = conv.conversationId === selectedConversationId;
          const isUnread = authState.type === 'authenticated' && conv.lastMessageSenderId !== authState.user.id;

          return (
            <div
              key={conv.conversationId}
              className={`${styles.item} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelectConversation(conv.conversationId)}
            >
              <Avatar>
                <AvatarImage src={conv.otherParticipant.avatarUrl || undefined} alt={conv.otherParticipant.displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className={styles.itemInfo}>
                <span className={styles.displayName}>{conv.otherParticipant.displayName}</span>
                <p className={`${styles.lastMessage} ${isUnread ? styles.unread : ''}`}>
                  {conv.lastMessageContent}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};