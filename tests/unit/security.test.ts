import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../../src/lib/security/rateLimiter';
import { sanitizeNoSqlInput, escapeHtml } from '../../src/lib/security/sanitize';

describe('Application Security & Hardening Tests', () => {
  describe('Rate Limiter', () => {
    it('allows requests within limit and throttles subsequent requests', () => {
      const testIp = `test_ip_${Date.now()}`;
      const options = { limit: 3, windowMs: 10000 };

      const req1 = checkRateLimit(testIp, options);
      expect(req1.allowed).toBe(true);
      expect(req1.remaining).toBe(2);

      const req2 = checkRateLimit(testIp, options);
      expect(req2.allowed).toBe(true);
      expect(req2.remaining).toBe(1);

      const req3 = checkRateLimit(testIp, options);
      expect(req3.allowed).toBe(true);
      expect(req3.remaining).toBe(0);

      // 4th request must be throttled
      const req4 = checkRateLimit(testIp, options);
      expect(req4.allowed).toBe(false);
      expect(req4.remaining).toBe(0);
      expect(req4.resetMs).toBeGreaterThan(0);
    });
  });

  describe('NoSQL Injection Defense', () => {
    it('strips dangerous MongoDB operator keys starting with $', () => {
      const maliciousPayload = {
        username: 'admin',
        password: { $gt: '' },
        $where: 'this.password.length > 0',
        nested: {
          $ne: null,
          validKey: 'normal-value',
        },
      };

      const sanitized: any = sanitizeNoSqlInput(maliciousPayload);
      expect(sanitized.username).toBe('admin');
      expect(sanitized.password).toEqual({});
      expect(sanitized.$where).toBeUndefined();
      expect(sanitized.nested.$ne).toBeUndefined();
      expect(sanitized.nested.validKey).toBe('normal-value');
    });

    it('strips keys containing dots to prevent property traversal', () => {
      const dotPayload = {
        'user.role': 'admin',
        cleanKey: 'value',
      };

      const sanitized: any = sanitizeNoSqlInput(dotPayload);
      expect(sanitized['user.role']).toBeUndefined();
      expect(sanitized.cleanKey).toBe('value');
    });
  });

  describe('Cross-Site Scripting (XSS) Defenses', () => {
    it('escapes dangerous HTML characters in user input', () => {
      const xssInput = '<script>alert("xss")</script><img src=x onerror="stealCookies()"/>';
      const safe = escapeHtml(xssInput);

      expect(safe).not.toContain('<script>');
      expect(safe).toContain('&lt;script&gt;');
      expect(safe).toContain('&lt;img');
      expect(safe).toContain('&quot;');
    });
  });
});
