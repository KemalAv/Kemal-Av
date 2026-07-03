import React from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const config = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"]
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"]
    ]
  }
};

interface LatexRendererProps {
  content: string;
  enabled?: boolean;
  renderWithMarkdown?: boolean;
  variant?: 'article' | 'ui';
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ 
  content, 
  enabled = true,
  renderWithMarkdown = false,
  variant = 'ui'
}) => {
  if (!enabled) return <>{content}</>;

  const proseClasses = variant === 'article'
    ? "markdown-content prose dark:prose-invert max-w-none prose-p:my-6 prose-p:leading-relaxed prose-headings:font-display prose-headings:mt-10 prose-headings:mb-4"
    : "markdown-content prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-display";

  return (
    <MathJaxContext config={config}>
      <MathJax>
        {renderWithMarkdown ? (
          <div className={proseClasses}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </MathJax>
    </MathJaxContext>
  );
};
