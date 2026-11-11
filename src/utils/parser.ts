import { ActionPayload, CodeSnippet } from '../types';

export interface ParsedModelResponse {
  cleanText: string;
  actionPayload: ActionPayload | null;
  codeSnippets: CodeSnippet[];
}

export function parseOnaResponse(rawText: string): ParsedModelResponse {
  let actionPayload: ActionPayload | null = null;
  const codeSnippets: CodeSnippet[] = [];

  // Match all markdown code blocks: ```lang\ncode\n```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let cleanText = rawText;

  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(rawText)) !== null) {
    const fullBlock = match[0];
    const lang = (match[1] || 'text').toLowerCase().trim();
    const code = match[2].trim();

    if (lang === 'json') {
      try {
        const parsed = JSON.parse(code);
        // Verify if it looks like an action payload
        if (
          parsed &&
          typeof parsed === 'object' &&
          (parsed.action_type || parsed.target_app || parsed.command)
        ) {
          actionPayload = {
            status: parsed.status || 'success',
            action_type: parsed.action_type || 'EXECUTE_INTENT',
            target_app: parsed.target_app || 'System',
            command: parsed.command || 'execute',
            query: parsed.query || '',
            details: parsed.details || {},
          };
          // Remove the JSON block from clean conversational text so user has a clean chat bubble
          cleanText = cleanText.replace(fullBlock, '');
          continue;
        }
      } catch {
        // Not valid JSON, keep as standard code block
      }
    }

    codeSnippets.push({
      language: lang || 'code',
      code: code,
      title: getSnippetTitle(lang),
    });
  }

  // Also clean out standalone JSON blocks if they didn't have ```json tags
  if (!actionPayload) {
    const rawJsonRegex = /\{\s*"status":\s*"[^"]*",\s*"action_type":\s*"[^"]*"[\s\S]*?\}/;
    const rawMatch = rawJsonRegex.exec(cleanText);
    if (rawMatch) {
      try {
        const parsed = JSON.parse(rawMatch[0]);
        actionPayload = {
          status: parsed.status || 'success',
          action_type: parsed.action_type || 'EXECUTE_INTENT',
          target_app: parsed.target_app || 'System',
          command: parsed.command || 'execute',
          query: parsed.query || '',
          details: parsed.details || {},
        };
        cleanText = cleanText.replace(rawMatch[0], '');
      } catch {
        // ignore
      }
    }
  }

  // Clean trailing empty lines
  cleanText = cleanText.trim();

  return {
    cleanText,
    actionPayload,
    codeSnippets,
  };
}

function getSnippetTitle(lang: string): string {
  switch (lang) {
    case 'python':
      return 'Python Automation Script';
    case 'dart':
    case 'flutter':
      return 'Flutter / Dart Source';
    case 'javascript':
    case 'js':
      return 'JavaScript Module';
    case 'typescript':
    case 'ts':
      return 'TypeScript Source';
    case 'kotlin':
      return 'Android Kotlin Intent Service';
    default:
      return 'Code Snippet';
  }
}
