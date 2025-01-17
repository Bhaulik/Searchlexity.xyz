import React, { useState } from 'react';
import { Message } from './components/chat/message';
import { ChatInput } from './components/chat/chat-input';
import { Sidebar } from './components/sidebar';
import { DiscoverPage } from './components/discover/discover-page';
import { NewThreadDialog } from './components/new-thread-dialog';
import { useSearchStore } from './store/search-store';

type Page = 'home' | 'discover' | 'spaces' | 'library';

function App() {
  const { messages, isLoading, addMessage } = useSearchStore();
  const [lastQuery, setLastQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<Page>('discover');
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);

  const handleSubmit = (content: string) => {
    setLastQuery(content);
    addMessage({ 
      type: 'user', 
      content,
      isFollowUp: messages.length > 0 
    });
    
    setTimeout(() => {
      addMessage({
        type: 'assistant',
        content: 'This is a simulated response that would come from an AI model.',
        sources: [
          {
            id: '1',
            title: 'Example Source',
            url: 'https://example.com',
            author: 'Author Name',
            snippet: 'This is an example source citation.'
          }
        ],
        related: [
          'What are the benefits?',
          'How does this work?',
          'Tell me more about this topic',
          'Can you explain further?',
          'What are the alternatives?'
        ]
      });
    }, 1000);
  };

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    if (page === 'home') {
      useSearchStore.getState().clearMessages();
    }
  };

  const handleNewThread = () => {
    setIsNewThreadOpen(true);
  };

  const handleRelatedClick = (question: string) => {
    handleSubmit(question);
  };

  return (
    <div className="flex h-screen bg-perplexity-bg text-perplexity-text">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
        onNewThread={handleNewThread}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentPage === 'discover' ? (
          <DiscoverPage />
        ) : currentPage === 'home' && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto space-y-8 px-4">
              <h1 className="text-[56px] leading-[1.1] font-medium text-center">
                What do you want to know?
              </h1>
              <ChatInput onSubmit={handleSubmit} disabled={isLoading} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto p-6">
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <Message 
                      key={index} 
                      {...message} 
                      onRelatedClick={handleRelatedClick}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex gap-2 items-center text-perplexity-muted p-4">
                      <div className="animate-pulse">Thinking...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-perplexity-bg border-t border-perplexity-card p-4">
              <div className="max-w-3xl mx-auto">
                <ChatInput 
                  onSubmit={handleSubmit} 
                  disabled={isLoading} 
                  isFollowUp={true}
                />
              </div>
            </div>
          </>
        )}

        <footer className="border-t border-perplexity-card py-4 px-6">
          <div className="flex items-center justify-between text-sm text-perplexity-muted">
            <div className="flex gap-4">
              <a href="#" className="hover:text-perplexity-text">Pro</a>
              <a href="#" className="hover:text-perplexity-text">Enterprise</a>
              <a href="#" className="hover:text-perplexity-text">Blog</a>
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-perplexity-text">English</a>
              <a href="#" className="hover:text-perplexity-text">Help</a>
            </div>
          </div>
        </footer>
      </main>

      <NewThreadDialog 
        isOpen={isNewThreadOpen}
        onClose={() => setIsNewThreadOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default App;