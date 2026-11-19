/**
 * Safe Input Sanitizer & NoSQL Injection Protection
 * Strips MongoDB operator keys ($gt, $ne, $where, etc.) and encodes dangerous HTML.
 */

export function sanitizeNoSqlInput<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    // If string starts with a dollar sign followed by word characters, strip the leading dollar
    return input.replace(/^\$([a-zA-Z0-9_]+)/g, '$1') as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeNoSqlInput(item)) as unknown as T;
  }

  if (typeof input === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      // Disallow keys that start with '$' or contain dots (MongoDB injection prevention)
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleanObj[key] = sanitizeNoSqlInput(value);
    }
    return cleanObj as T;
  }

  return input;
}

export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
