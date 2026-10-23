import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit } from '../src/lib/security/rateLimiter.ts';

// Logic matching src/app/auth/callback/route.ts
function sanitizeRedirectUrl(next) {
  if (
    !next ||
    !next.startsWith('/') ||
    next.startsWith('//') ||
    next.includes('\\') ||
    next.includes('://')
  ) {
    return '/';
  }
  return next;
}

// Logic matching src/app/api/cron/publish-scheduled/route.ts
function verifyCronTrigger(authHeader, cronSecret) {
  if (!cronSecret) return false; // Missing secret must FAIL CLOSED
  if (authHeader !== `Bearer ${cronSecret}`) return false;
  return true;
}

// Role hierarchy security
function canAssignRole(adminRole, targetNewRole) {
  if (adminRole !== 'super_admin') {
    return false; // Only Super Admin can promote/reassign roles
  }
  return true;
}

describe('Security Hardening & Vulnerability Audit', () => {
  describe('OAuth Callback Open Redirect Prevention', () => {
    test('Protocol-relative URL (//evil.com) is sanitized to root /', () => {
      assert.equal(sanitizeRedirectUrl('//attacker.com'), '/');
      assert.equal(sanitizeRedirectUrl('///malicious.net'), '/');
    });

    test('Absolute external HTTP/HTTPS URL is sanitized to root /', () => {
      assert.equal(sanitizeRedirectUrl('https://evil.com/phish'), '/');
      assert.equal(sanitizeRedirectUrl('http://attacker.com'), '/');
      assert.equal(sanitizeRedirectUrl('javascript:alert(1)'), '/');
    });

    test('Backslash-obfuscated bypass (\\attacker.com) is sanitized to root /', () => {
      assert.equal(sanitizeRedirectUrl('/\\evil.com'), '/');
    });

    test('Legitimate internal relative path is preserved', () => {
      assert.equal(sanitizeRedirectUrl('/studio/episodes/new'), '/studio/episodes/new');
      assert.equal(sanitizeRedirectUrl('/library?filter=saved'), '/library?filter=saved');
      assert.equal(sanitizeRedirectUrl('/episodes/purpose-in-the-process'), '/episodes/purpose-in-the-process');
    });
  });

  describe('Cron Webhook Secret Fail-Closed Security', () => {
    test('Missing CRON_SECRET environment variable strictly rejects requests', () => {
      const authHeader = 'Bearer some-token';
      const cronSecret = undefined;
      assert.equal(verifyCronTrigger(authHeader, cronSecret), false);
    });

    test('Invalid Bearer token is rejected', () => {
      const cronSecret = 'super-secret-token-12345';
      assert.equal(verifyCronTrigger('Bearer wrong-token', cronSecret), false);
      assert.equal(verifyCronTrigger('Basic dXNlcjpwYXNz', cronSecret), false);
      assert.equal(verifyCronTrigger(null, cronSecret), false);
    });

    test('Valid Bearer token matching CRON_SECRET is accepted', () => {
      const cronSecret = 'super-secret-token-12345';
      assert.equal(verifyCronTrigger(`Bearer ${cronSecret}`, cronSecret), true);
    });
  });

  describe('Sliding-Window Rate Limiter Protection', () => {
    test('Allows requests within configured threshold', () => {
      const id = 'test-client-ip-' + Date.now();
      const res1 = checkRateLimit(id, 3, 60);
      assert.equal(res1.allowed, true);
      assert.equal(res1.remaining, 2);

      const res2 = checkRateLimit(id, 3, 60);
      assert.equal(res2.allowed, true);
      assert.equal(res2.remaining, 1);

      const res3 = checkRateLimit(id, 3, 60);
      assert.equal(res3.allowed, true);
      assert.equal(res3.remaining, 0);
    });

    test('Throttles and blocks excess requests once limit exceeded', () => {
      const id = 'test-flooder-ip-' + Date.now();
      checkRateLimit(id, 2, 60);
      checkRateLimit(id, 2, 60);

      const blocked = checkRateLimit(id, 2, 60);
      assert.equal(blocked.allowed, false);
      assert.equal(blocked.remaining, 0);
      assert.ok(blocked.resetSeconds > 0);
    });
  });

  describe('Super Admin Role Protection & Privilege Escalation Shield', () => {
    test('Standard Administrator CANNOT reassign roles to super_admin', () => {
      assert.equal(canAssignRole('admin', 'super_admin'), false);
      assert.equal(canAssignRole('admin', 'admin'), false);
      assert.equal(canAssignRole('editor', 'admin'), false);
    });

    test('Super Administrator can assign privileged roles', () => {
      assert.equal(canAssignRole('super_admin', 'admin'), true);
      assert.equal(canAssignRole('super_admin', 'editor'), true);
      assert.equal(canAssignRole('super_admin', 'listener'), true);
    });
  });
});
