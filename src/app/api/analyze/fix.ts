export function generateFix(type: string): string {
  const fixes: Record<string, string> = {
    Injection: 'Use parameterized queries/prepared statements instead of string concatenation.',
    XSS: 'Sanitize user input with DOMPurify or html-entities before rendering.',
    Auth: 'Implement proper authentication checks with JWT/session validation.',
    Syntax: 'Check parentheses, quotes, colons, indentation.',
    Hardcoded: 'Move secrets to environment variables.',
    Crypto: 'Use secure algorithms like AES-GCM, avoid MD5/SHA1.',
    Path: 'Validate/sanitize file paths with path.resolve() + basename().'
  }
  return fixes[type as keyof typeof fixes] || 'Review and fix the issue described.'
}
