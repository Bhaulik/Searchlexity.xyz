import React from 'react';

interface StreamingTextProps {
  content: string;
  onComplete?: () => void;
}

export function StreamingText({ content, onComplete }: StreamingTextProps) {
  React.useEffect(() => {
    if (content && onComplete) {
      onComplete();
    }
  }, [content, onComplete]);

  return (
    <div className="whitespace-pre-wrap">
      {content}
    </div>
  );
}