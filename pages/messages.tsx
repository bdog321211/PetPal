import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../helpers/useAuth';
import { ConversationList } from '../components/ConversationList';
import { ConversationView } from '../components/ConversationView';
import { MessageSquare } from 'lucide-react';
import styles from './messages.module.css';

export default function MessagesPage() {
  const { authState } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

  if (authState.type === 'loading') {
    return <div className={styles.page}>Loading...</div>;
  }

  if (authState.type === 'unauthenticated') {
    return (
      <div className={styles.page}>
        <div className={styles.unauthenticated}>
          <h2>Please log in</h2>
          <p>You need to be logged in to view your messages.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Messages | Floot</title>
        <meta name="description" content="View and manage your conversations on Floot." />
      </Helmet>
      <div className={styles.page}>
        <div className={styles.sidebar}>
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
          />
        </div>
        <div className={styles.mainContent}>
          {selectedConversationId ? (
            <ConversationView
              conversationId={selectedConversationId}
              key={selectedConversationId} // Re-mount component on conversation change
            />
          ) : (
            <div className={styles.placeholder}>
              <MessageSquare size={48} className={styles.placeholderIcon} />
              <h2 className={styles.placeholderTitle}>Select a conversation</h2>
              <p className={styles.placeholderText}>
                Choose a conversation from the list to see your messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}