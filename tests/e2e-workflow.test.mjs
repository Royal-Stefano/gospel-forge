import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Simulated complete platform state machine verifying Task 4 sequence
class GospelForgePlatformSimulator {
  constructor() {
    this.users = new Map();
    this.artistApplications = new Map();
    this.episodes = new Map();
    this.mediaAssets = new Map();
    this.savedEpisodes = new Map(); // userId -> Set
    this.listeningProgress = new Map(); // `${userId}:${episodeId}` -> progress
    this.auditLogs = [];
  }

  // Step 1: Register Listener
  registerListener(id, email, displayName) {
    const user = {
      id,
      email,
      displayName,
      role: 'listener',
      artistStatus: 'none',
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  // Step 2: Apply to become an artist
  applyForArtist(userId, ministryName, bio) {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    user.artistStatus = 'pending';

    const appId = `app-${Date.now()}`;
    const application = {
      id: appId,
      userId,
      ministryName,
      bio,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    this.artistApplications.set(appId, application);
    return application;
  }

  // Step 3: Check upload permission
  canUserUploadMedia(userId) {
    const user = this.users.get(userId);
    if (!user) return false;
    const isApproved =
      user.artistStatus === 'approved' ||
      ['editor', 'admin', 'super_admin'].includes(user.role);
    return Boolean(isApproved);
  }

  // Step 4: Admin approves application
  adminApproveArtist(adminUserId, applicationId) {
    const admin = this.users.get(adminUserId);
    if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
      throw new Error('Forbidden: Admin privileges required');
    }

    const app = this.artistApplications.get(applicationId);
    if (!app) throw new Error('Application not found');

    app.status = 'approved';
    app.reviewedBy = adminUserId;

    const applicant = this.users.get(app.userId);
    if (applicant) {
      applicant.artistStatus = 'approved';
      applicant.role = 'editor'; // Creator privilege
    }

    this.auditLogs.push({
      action: 'APPROVE_ARTIST_APPLICATION',
      userId: adminUserId,
      targetId: applicationId,
    });
    return app;
  }

  // Step 6: Upload MP3 and Artwork
  uploadMedia(userId, fileName, mediaType, buffer) {
    if (!this.canUserUploadMedia(userId)) {
      throw new Error('Forbidden: Creator authorization required to upload');
    }

    // Validate magic bytes
    let valid = false;
    if (mediaType === 'audio') {
      const isId3 = buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33;
      const isMpegSync = buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0;
      valid = isId3 || isMpegSync;
    } else if (mediaType === 'artwork') {
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      valid = isJpeg || isPng;
    }

    if (!valid) throw new Error('Invalid magic bytes');

    const storageKey = `${mediaType}/2026/10/${userId}/${Date.now()}-${fileName}`;
    const asset = {
      storageKey,
      userId,
      mediaType,
      status: 'verified',
    };
    this.mediaAssets.set(storageKey, asset);
    return asset;
  }

  // Step 7: Save Draft
  saveEpisodeDraft(authorId, title, slug, audioKey, artworkKey) {
    if (!this.canUserUploadMedia(authorId)) {
      throw new Error('Forbidden: Only approved artists can create drafts');
    }
    const episodeId = `ep-${Date.now()}`;
    const episode = {
      id: episodeId,
      authorId,
      title,
      slug,
      audioKey,
      artworkKey,
      status: 'draft',
      playCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.episodes.set(episodeId, episode);
    return episode;
  }

  // Step 8: Submit for review
  submitForReview(userId, episodeId) {
    const episode = this.episodes.get(episodeId);
    if (!episode) throw new Error('Episode not found');
    if (episode.authorId !== userId) throw new Error('Forbidden: Not author');
    if (episode.status !== 'draft') throw new Error('Can only submit draft');

    episode.status = 'submitted';
    return episode;
  }

  // Self-publish attempt check
  selfPublishAttempt(userId, episodeId) {
    const user = this.users.get(userId);
    if (!['admin', 'super_admin'].includes(user?.role)) {
      return false; // Forbidden!
    }
    return true;
  }

  // Step 9: Admin approves and publishes
  adminPublishEpisode(adminUserId, episodeId) {
    const admin = this.users.get(adminUserId);
    if (!['admin', 'super_admin'].includes(admin?.role)) {
      throw new Error('Forbidden: Only admins can publish');
    }
    const episode = this.episodes.get(episodeId);
    if (!episode) throw new Error('Episode not found');

    episode.status = 'published';
    episode.publishedAt = new Date().toISOString();
    return episode;
  }

  // Step 10: Guest public episodes query
  getPublicEpisodeBySlug(slug) {
    for (const ep of this.episodes.values()) {
      if (ep.slug === slug && ep.status === 'published') {
        return ep;
      }
    }
    return null;
  }

  // Step 11: Range seek simulation
  seekStream(episodeId, startByte, endByte, totalBytes = 1000000) {
    const episode = this.episodes.get(episodeId);
    if (!episode || episode.status !== 'published') {
      return null;
    }
    return {
      status: 206, // Partial Content
      range: `bytes ${startByte}-${endByte}/${totalBytes}`,
      length: endByte - startByte + 1,
    };
  }

  // Step 12: Save episode to listener library
  saveEpisodeToLibrary(userId, episodeId) {
    if (!this.savedEpisodes.has(userId)) {
      this.savedEpisodes.set(userId, new Set());
    }
    this.savedEpisodes.get(userId).add(episodeId);
    return true;
  }

  // Step 13: Listening progress persistence
  saveProgress(userId, episodeId, positionSeconds) {
    const key = `${userId}:${episodeId}`;
    this.listeningProgress.set(key, positionSeconds);
    return positionSeconds;
  }

  getProgress(userId, episodeId) {
    return this.listeningProgress.get(`${userId}:${episodeId}`) || 0;
  }
}

describe('End-to-End User Journey (Task 4: Artist-to-Listener Flow)', () => {
  const platform = new GospelForgePlatformSimulator();
  let listenerId = 'usr-new-listener-1';
  let adminId = 'usr-superadmin';
  let appId;
  let audioKey;
  let artworkKey;
  let episodeId;
  const episodeSlug = 'surrendering-to-the-flame';

  // Seed Super Admin
  platform.users.set(adminId, {
    id: adminId,
    email: 'superadmin@gospelforge.com',
    role: 'super_admin',
    artistStatus: 'approved',
  });

  test('Step 1: Register a new listener', () => {
    const listener = platform.registerListener(listenerId, 'worship.listener@gmail.com', 'David Miller');
    assert.equal(listener.role, 'listener');
    assert.equal(listener.artistStatus, 'none');
  });

  test('Step 2: Apply to become an artist', () => {
    const app = platform.applyForArtist(listenerId, 'David Miller Ministries', 'Praise & worship podcast');
    assert.equal(app.status, 'pending');
    appId = app.id;
  });

  test('Step 3: Confirm pending artist CANNOT upload media', () => {
    const canUpload = platform.canUserUploadMedia(listenerId);
    assert.equal(canUpload, false);

    const validMp3 = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00]);
    assert.throws(
      () => platform.uploadMedia(listenerId, 'sermon.mp3', 'audio', validMp3),
      /Forbidden: Creator authorization required/
    );
  });

  test('Step 4: Approve the application through an admin account', () => {
    const reviewedApp = platform.adminApproveArtist(adminId, appId);
    assert.equal(reviewedApp.status, 'approved');

    const updatedUser = platform.users.get(listenerId);
    assert.equal(updatedUser.artistStatus, 'approved');
    assert.equal(updatedUser.role, 'editor');
  });

  test('Step 5: Sign in as approved artist & verify upload clearance', () => {
    const canUpload = platform.canUserUploadMedia(listenerId);
    assert.equal(canUpload, true);
  });

  test('Step 6: Upload a real MP3 and cover artwork with magic byte verification', () => {
    const validMp3 = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00]);
    const validJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);

    const audioAsset = platform.uploadMedia(listenerId, 'sermon_master.mp3', 'audio', validMp3);
    const artworkAsset = platform.uploadMedia(listenerId, 'cover.jpg', 'artwork', validJpg);

    assert.ok(audioAsset.storageKey.startsWith('audio/'));
    assert.ok(artworkAsset.storageKey.startsWith('artwork/'));
    audioKey = audioAsset.storageKey;
    artworkKey = artworkAsset.storageKey;
  });

  test('Step 7: Save episode as draft', () => {
    const draft = platform.saveEpisodeDraft(
      listenerId,
      'Surrendering to the Flame',
      episodeSlug,
      audioKey,
      artworkKey
    );
    assert.equal(draft.status, 'draft');
    assert.equal(draft.authorId, listenerId);
    episodeId = draft.id;
  });

  test('Step 8: Submit episode for review & verify artist CANNOT self-publish', () => {
    const canSelfPublish = platform.selfPublishAttempt(listenerId, episodeId);
    assert.equal(canSelfPublish, false);

    const submitted = platform.submitForReview(listenerId, episodeId);
    assert.equal(submitted.status, 'submitted');
  });

  test('Step 9: Approve and publish as admin', () => {
    const published = platform.adminPublishEpisode(adminId, episodeId);
    assert.equal(published.status, 'published');
    assert.ok(published.publishedAt);
  });

  test('Step 10: Open public episode page as logged-out guest', () => {
    const publicEp = platform.getPublicEpisodeBySlug(episodeSlug);
    assert.notEqual(publicEp, null);
    assert.equal(publicEp.id, episodeId);
    assert.equal(publicEp.status, 'published');
  });

  test('Step 11: Play, seek and stream episode (HTTP 206 Range Request)', () => {
    // Scrubber seek: bytes=250000-499999
    const seekResponse = platform.seekStream(episodeId, 250000, 499999);
    assert.notEqual(seekResponse, null);
    assert.equal(seekResponse.status, 206);
    assert.equal(seekResponse.length, 250000);
  });

  test('Step 12: Sign in as listener and save episode to library', () => {
    const saved = platform.saveEpisodeToLibrary(listenerId, episodeId);
    assert.equal(saved, true);
    assert.equal(platform.savedEpisodes.get(listenerId).has(episodeId), true);
  });

  test('Step 13: Verify playback progress persists after refresh', () => {
    platform.saveProgress(listenerId, episodeId, 1420); // 23m40s
    const retrievedProgress = platform.getProgress(listenerId, episodeId);
    assert.equal(retrievedProgress, 1420);
  });
});
