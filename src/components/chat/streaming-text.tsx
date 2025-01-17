import React, { useState, useEffect } from 'react';

interface StreamingTextProps {
  content: string;
  speed?: number;
  onComplete?: () => void;
}

export function StreamingText({ content, speed = 30, onComplete }: StreamingTextProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset state when content changes
    setDisplayedContent('');
    setCurrentIndex(0);
  }, [content]);

  useEffect(() => {
    if (currentIndex < content.length) {
      const chunk = content.slice(currentIndex, currentIndex + 3); // Stream 3 chars at a time
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + chunk);
        setCurrentIndex(prev => prev + 3);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete && displayedContent.length > 0) {
      onComplete();
    }
  }, [content, currentIndex, speed, onComplete, displayedContent]);

  return (
    <div className="whitespace-pre-wrap">
      {displayedContent}
      {currentIndex < content.length && (
        <span className="ml-0.5 animate-pulse">▊</span>
      )}
    </div>
  );
}