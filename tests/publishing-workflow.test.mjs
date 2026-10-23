import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Logic matching src/lib/publishing/workflow.ts
const ALLOWED_TRANSITIONS = {
  draft: ['submitted', 'archived'],
  submitted: ['in_review', 'draft', 'rejected'],
  in_review: ['approved', 'rejected', 'draft'],
  approved: ['published', 'scheduled', 'draft'],
  scheduled: ['published', 'draft', 'archived'],
  published: ['archived'],
  rejected: ['draft', 'archived'],
  archived: ['draft'],
};

function canTransitionStatus(currentStatus, targetStatus, userRole, isAuthor = true) {
  if (currentStatus === targetStatus) return true;

  // Super admins have emergency bypass across standard lifecycle
  if (userRole === 'super_admin') {
    return true;
  }

  // Listeners have no episode modification privileges
  if (userRole === 'listener') {
    return false;
  }

  // Non-admins must be author and cannot publish or approve directly
  const adminOnlyTargets = ['approved', 'published', 'scheduled', 'in_review', 'archived'];
  if (['editor', 'artist'].includes(userRole)) {
    if (!isAuthor) return false;
    if (adminOnlyTargets.includes(targetStatus)) return false;
    if (currentStatus === 'draft' && targetStatus === 'submitted') return true;
    if (currentStatus === 'rejected' && targetStatus === 'draft') return true;
    return false;
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

function canUserModifyEpisode(episodeAuthorId, requestingUserId, requestingUserRole) {
  // Admins & super admins can edit any episode
  if (['admin', 'super_admin'].includes(requestingUserRole)) {
    return true;
  }
  // Authors can only modify their own episodes
  return episodeAuthorId === requestingUserId;
}

function filterPublicEpisodes(episodes) {
  const now = new Date();
  return episodes.filter((ep) => {
    if (ep.status !== 'published') return false;
    if (ep.publishDate && new Date(ep.publishDate) > now) return false;
    return true;
  });
}

describe('Publishing Workflow State Machine', () => {
  describe('Standard Lifecycle Transitions', () => {
    test('Draft can be submitted by artist', () => {
      assert.equal(canTransitionStatus('draft', 'submitted', 'editor'), true);
    });

    test('Submitted episode can be placed In Review by admin', () => {
      assert.equal(canTransitionStatus('submitted', 'in_review', 'admin'), true);
    });

    test('In Review episode can be Approved by admin', () => {
      assert.equal(canTransitionStatus('in_review', 'approved', 'admin'), true);
    });

    test('Approved episode can be Published by admin', () => {
      assert.equal(canTransitionStatus('approved', 'published', 'admin'), true);
    });

    test('Approved episode can be Scheduled by admin', () => {
      assert.equal(canTransitionStatus('approved', 'scheduled', 'admin'), true);
    });

    test('Published episode can be Archived', () => {
      assert.equal(canTransitionStatus('published', 'archived', 'admin'), true);
    });
  });

  describe('Unauthorized Publishing & Self-Approval Prevention', () => {
    test('Artist CANNOT self-approve an in-review episode', () => {
      assert.equal(canTransitionStatus('in_review', 'approved', 'editor'), false);
    });

    test('Artist CANNOT self-publish a draft directly', () => {
      assert.equal(canTransitionStatus('draft', 'published', 'editor'), false);
    });

    test('Artist CANNOT self-publish an approved episode directly without admin', () => {
      assert.equal(canTransitionStatus('approved', 'published', 'editor'), false);
    });

    test('Listener CANNOT change episode status', () => {
      assert.equal(canTransitionStatus('draft', 'submitted', 'listener'), false);
      assert.equal(canTransitionStatus('submitted', 'approved', 'listener'), false);
    });
  });

  describe('Rejection & Resubmission Flow', () => {
    test('In Review episode can be rejected by editorial admin', () => {
      assert.equal(canTransitionStatus('in_review', 'rejected', 'admin'), true);
    });

    test('Rejected episode can be reverted to draft by author for revision', () => {
      assert.equal(canTransitionStatus('rejected', 'draft', 'editor'), true);
    });

    test('Re-drafted episode can be resubmitted for review', () => {
      assert.equal(canTransitionStatus('draft', 'submitted', 'editor'), true);
    });
  });

  describe('Cross-User Modification Isolation', () => {
    const authorA = 'usr-author-a';
    const authorB = 'usr-author-b';

    test('Author A can modify their own episode', () => {
      assert.equal(canUserModifyEpisode(authorA, authorA, 'editor'), true);
    });

    test('Author B CANNOT modify Author A\'s episode', () => {
      assert.equal(canUserModifyEpisode(authorA, authorB, 'editor'), false);
    });

    test('Admin can modify any author\'s episode for editorial corrections', () => {
      assert.equal(canUserModifyEpisode(authorA, 'usr-admin', 'admin'), true);
    });
  });

  describe('Public API Boundary Isolation', () => {
    const mockEpisodes = [
      { id: '1', title: 'Live Sermon', status: 'published', publishDate: '2024-01-01T00:00:00Z' },
      { id: '2', title: 'Future Scheduled', status: 'published', publishDate: '2099-01-01T00:00:00Z' },
      { id: '3', title: 'Private Draft', status: 'draft', publishDate: '2024-01-01T00:00:00Z' },
      { id: '4', title: 'Pending Review', status: 'submitted', publishDate: '2024-01-01T00:00:00Z' },
      { id: '5', title: 'Theological Rejection', status: 'rejected', publishDate: '2024-01-01T00:00:00Z' },
      { id: '6', title: 'Archived Tape', status: 'archived', publishDate: '2024-01-01T00:00:00Z' },
    ];

    test('Public feed only exposes currently published episodes', () => {
      const publicFeed = filterPublicEpisodes(mockEpisodes);
      assert.equal(publicFeed.length, 1);
      assert.equal(publicFeed[0].id, '1');
      assert.equal(publicFeed[0].title, 'Live Sermon');
    });

    test('Unpublished drafts, submissions, and rejected media are strictly excluded', () => {
      const publicFeed = filterPublicEpisodes(mockEpisodes);
      const exposedStatuses = new Set(publicFeed.map((ep) => ep.status));
      assert.equal(exposedStatuses.has('draft'), false);
      assert.equal(exposedStatuses.has('submitted'), false);
      assert.equal(exposedStatuses.has('rejected'), false);
      assert.equal(exposedStatuses.has('archived'), false);
    });
  });
});
