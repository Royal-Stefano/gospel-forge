import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

class AnalyticsTracker {
  constructor() {
    this.playEvents = [];
    this.episodePlayCounts = new Map();
  }

  generateSessionHash(ip, userAgent, dateStr) {
    return crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}-${dateStr}`)
      .digest('hex');
  }

  recordPlay(episodeId, authorId, sessionHash, durationSeconds = 0) {
    const thirtyMinutesMs = 30 * 60 * 1000;
    const now = Date.now();

    // Check for duplicate within 30-minute window
    const recentDuplicate = this.playEvents.find(
      (ev) =>
        ev.episodeId === episodeId &&
        ev.sessionHash === sessionHash &&
        now - ev.timestamp < thirtyMinutesMs
    );

    if (recentDuplicate) {
      return { recorded: false, deduplicated: true };
    }

    // Record legitimate play
    this.playEvents.push({
      id: `ev-${now}-${Math.random()}`,
      episodeId,
      authorId,
      sessionHash,
      durationSeconds,
      timestamp: now,
    });

    const currentCount = this.episodePlayCounts.get(episodeId) || 0;
    this.episodePlayCounts.set(episodeId, currentCount + 1);

    return { recorded: true, deduplicated: false };
  }

  getCreatorStats(authorId) {
    const authorEvents = this.playEvents.filter((ev) => ev.authorId === authorId);
    const uniqueListeners = new Set(authorEvents.map((ev) => ev.sessionHash)).size;
    const totalPlays = authorEvents.length;

    return {
      totalPlays,
      uniqueListeners,
    };
  }
}

describe('Real Analytics & Play Deduplication Telemetry', () => {
  let tracker;

  test('Initialize analytics tracker', () => {
    tracker = new AnalyticsTracker();
    assert.ok(tracker);
  });

  describe('Privacy-Conscious Session Hashing', () => {
    test('Hashes IP and User Agent into deterministic daily SHA-256 token', () => {
      const hash1 = tracker.generateSessionHash('192.168.1.1', 'Mozilla/5.0', '2026-10-24');
      const hash2 = tracker.generateSessionHash('192.168.1.1', 'Mozilla/5.0', '2026-10-24');
      assert.equal(hash1, hash2);
      assert.equal(hash1.length, 64);
      assert.notEqual(hash1, '192.168.1.1'); // Raw IP must never be stored
    });

    test('Different IPs or dates produce segregated session tokens', () => {
      const tokenA = tracker.generateSessionHash('10.0.0.1', 'Safari', '2026-10-24');
      const tokenB = tracker.generateSessionHash('10.0.0.2', 'Safari', '2026-10-24');
      assert.notEqual(tokenA, tokenB);
    });
  });

  describe('Duplicate-Play Prevention & Window Enforcement', () => {
    const episodeId = 'ep-romans-8';
    const authorId = 'usr-author-paul';
    const sessionToken = 'session-hash-abc-123';

    test('First play event is recorded as a genuine play and increments play count', () => {
      const result = tracker.recordPlay(episodeId, authorId, sessionToken, 45);
      assert.equal(result.recorded, true);
      assert.equal(result.deduplicated, false);
      assert.equal(tracker.episodePlayCounts.get(episodeId), 1);
    });

    test('Subsequent play within 30-minute window is deduplicated and does not increment play count', () => {
      const result2 = tracker.recordPlay(episodeId, authorId, sessionToken, 90);
      assert.equal(result2.recorded, false);
      assert.equal(result2.deduplicated, true);
      assert.equal(tracker.episodePlayCounts.get(episodeId), 1);
    });

    test('Play from a different listener session on same episode is recorded', () => {
      const otherListener = 'session-hash-xyz-789';
      const result = tracker.recordPlay(episodeId, authorId, otherListener, 30);
      assert.equal(result.recorded, true);
      assert.equal(result.deduplicated, false);
      assert.equal(tracker.episodePlayCounts.get(episodeId), 2);
    });
  });

  describe('Creator Audience Aggregation', () => {
    test('Calculates total plays and distinct unique listeners correctly', () => {
      const authorId = 'usr-author-paul';
      const stats = tracker.getCreatorStats(authorId);
      assert.equal(stats.totalPlays, 2);
      assert.equal(stats.uniqueListeners, 2);
    });
  });
});
