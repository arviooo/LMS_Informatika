import React from 'react';

interface RichTextRendererProps {
  content?: string | null;
  className?: string;
}

export function parseRichTextToHtml(rawText: string = ''): string {
  if (!rawText) return '';

  let text = rawText;

  // Normalize line endings
  text = text.replace(/\r\n/g, '\n');

  // Protect safe HTML tags
  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'ul', 'ol', 'li', 'blockquote', 'code', 'h1', 'h2', 'h3', 'span'];
  const tokenMap: Record<string, string> = {};
  let tokenCounter = 0;

  text = text.replace(/<\/?([a-z0-9]+)[^>]*>/gi, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      const token = `__HTML_TOKEN_${tokenCounter++}__`;
      tokenMap[token] = match;
      return token;
    }
    return match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  });

  // Convert markdown elements line by line
  const lines = text.split('\n');
  const processedLines: string[] = [];
  let inBulletList = false;
  let inNumberList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Bullet List (- or *)
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!inBulletList) {
        if (inNumberList) {
          processedLines.push('</ol>');
          inNumberList = false;
        }
        processedLines.push('<ul class="list-disc list-outside pl-5 my-1.5 space-y-1">');
        inBulletList = true;
      }
      processedLines.push(`<li>${bulletMatch[2]}</li>`);
      continue;
    } else if (inBulletList) {
      processedLines.push('</ul>');
      inBulletList = false;
    }

    // Number List (1. 2.)
    const numberMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (numberMatch) {
      if (!inNumberList) {
        if (inBulletList) {
          processedLines.push('</ul>');
          inBulletList = false;
        }
        processedLines.push('<ol class="list-decimal list-outside pl-5 my-1.5 space-y-1">');
        inNumberList = true;
      }
      processedLines.push(`<li>${numberMatch[2]}</li>`);
      continue;
    } else if (inNumberList) {
      processedLines.push('</ol>');
      inNumberList = false;
    }

    // Heading 1 (# )
    if (line.startsWith('# ')) {
      processedLines.push(`<h1 class="text-xl sm:text-2xl font-black my-2.5 text-on-surface leading-tight">${line.substring(2)}</h1>`);
      continue;
    }

    // Heading 2 (## )
    if (line.startsWith('## ')) {
      processedLines.push(`<h2 class="text-lg sm:text-xl font-bold my-2 text-on-surface leading-snug">${line.substring(3)}</h2>`);
      continue;
    }

    // Heading 3 (### )
    if (line.startsWith('### ')) {
      processedLines.push(`<h3 class="text-base sm:text-lg font-bold my-1.5 text-on-surface">${line.substring(4)}</h3>`);
      continue;
    }

    // Blockquote (> )
    if (line.startsWith('> ')) {
      processedLines.push(`<blockquote class="border-l-4 border-primary pl-3.5 py-1.5 my-2 bg-primary/5 rounded-r-xl text-on-surface font-medium italic">${line.substring(2)}</blockquote>`);
      continue;
    }

    // Regular line
    if (line.trim() === '') {
      processedLines.push('<div class="h-2"></div>');
    } else {
      processedLines.push(`<p class="my-1 text-on-surface">${line}</p>`);
    }
  }

  if (inBulletList) processedLines.push('</ul>');
  if (inNumberList) processedLines.push('</ol>');

  let result = processedLines.join('');

  // Inline formatting:
  // Bold **text**
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-on-surface">$1</strong>');
  // Italic *text* or _text_
  result = result.replace(/(^|[^\*])\*([^\*]+?)\*([^\*]|$)/g, '$1<em class="italic">$2</em>$3');
  result = result.replace(/(^|[^_])_([^_]+?)_([^_]|$)/g, '$1<em class="italic">$2</em>$3');
  // Underline <u>text</u>
  result = result.replace(/<u>(.+?)<\/u>/gi, '<span class="underline underline-offset-2">$1</span>');
  // Inline code `code`
  result = result.replace(/`([^`]+)`/g, '<code class="bg-surface-container-high px-1.5 py-0.5 rounded text-xs font-mono text-primary font-semibold">$1</code>');

  // Restore protected HTML tokens
  for (const [token, htmlTag] of Object.entries(tokenMap)) {
    result = result.replace(token, htmlTag);
  }

  return result;
}

export default function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  if (!content) return null;
  const html = parseRichTextToHtml(content);

  return (
    <div 
      className={`rich-content prose prose-sm max-w-none text-on-surface leading-relaxed break-words font-body-md ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
