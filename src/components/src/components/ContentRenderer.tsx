import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { LatexRenderer } from './LatexRenderer';

interface ContentRendererProps {
  content: string;
  latexEnabled?: boolean;
  className?: string;
  variant?: 'article' | 'ui';
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  content, 
  latexEnabled = true,
  className = '',
  variant = 'ui'
}) => {
  // Pre-process content to ensure single newlines become double newlines
  // for that "Word-like" paragraph spacing the user expects in articles.
  const processedContent = React.useMemo(() => {
    if (!content) return '';
    if (variant !== 'article') return content;
    // Replace single newlines with double newlines, but don't triple them
    return content.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');
  }, [content, variant]);

  const proseClasses = variant === 'article' 
    ? `prose dark:prose-invert max-w-none prose-p:my-6 ${className}`
    : `prose dark:prose-invert max-w-none ${className}`;

  if (latexEnabled) {
    return (
      <div className={proseClasses}>
        <LatexRenderer 
          content={processedContent} 
          renderWithMarkdown={true}
          variant={variant}
        />
      </div>
    );
  }

  return (
    <div className={proseClasses}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{processedContent}</ReactMarkdown>
    </div>
  );
};
