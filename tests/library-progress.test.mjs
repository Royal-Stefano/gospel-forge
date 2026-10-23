import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Logic representing library, listening progress and playlist management
class ListenerLibraryService {
  constructor() {
    this.savedEpisodes = new Map(); // userId -> Set of episodeIds
    this.playbackProgress = new Map(); // `${userId}:${episodeId}` -> { positionSeconds, durationSeconds, completed, updatedAt }
    this.playlists = new Map(); // playlistId -> { id, userId, name, items: [] }
  }

  toggleSaveEpisode(userId, episodeId) {
    if (!this.savedEpisodes.has(userId)) {
      this.savedEpisodes.set(userId, new Set());
    }
    const userSaves = this.savedEpisodes.get(userId);
    if (userSaves.has(episodeId)) {
      userSaves.delete(episodeId);
      return false; // Removed
    } else {
      userSaves.add(episodeId);
      return true; // Added
    }
  }

  isEpisodeSaved(userId, episodeId) {
    return this.savedEpisodes.get(userId)?.has(episodeId) ?? false;
  }

  recordProgress(userId, episodeId, positionSeconds, durationSeconds) {
    const key = `${userId}:${episodeId}`;
    const completedThreshold = 0.9; // 90% considered completed
    const isCompleted = durationSeconds > 0 && positionSeconds / durationSeconds >= completedThreshold;

    const record = {
      positionSeconds,
      durationSeconds,
      completed: isCompleted,
      updatedAt: new Date().toISOString(),
    };
    this.playbackProgress.set(key, record);
    return record;
  }

  getProgress(userId, episodeId) {
    return this.playbackProgress.get(`${userId}:${episodeId}`) || null;
  }

  createPlaylist(userId, name) {
    const id = `pl-${Date.now()}`;
    const playlist = { id, userId, name, items: [] };
    this.playlists.set(id, playlist);
    return playlist;
  }

  addPlaylistItem(playlistId, episodeId) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) throw new Error('Playlist not found');
    const position = playlist.items.length;
    playlist.items.push({ episodeId, position });
    return playlist;
  }

  reorderPlaylist(playlistId, fromIndex, toIndex) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) throw new Error('Playlist not found');
    const [moved] = playlist.items.splice(fromIndex, 1);
    playlist.items.splice(toIndex, 0, moved);
    playlist.items.forEach((item, idx) => {
      item.position = idx;
    });
    return playlist;
  }
}

describe('Listener Library & Playback Progress', () => {
  let service;

  test('Initialize empty service', () => {
    service = new ListenerLibraryService();
    assert.ok(service);
  });

  describe('Saved Episodes Toggle & Isolation', () => {
    test('User can save and unsave episodes', () => {
      const userId = 'usr-listener-1';
      const epId = 'ep-romans-8';

      assert.equal(service.isEpisodeSaved(userId, epId), false);

      const added = service.toggleSaveEpisode(userId, epId);
      assert.equal(added, true);
      assert.equal(service.isEpisodeSaved(userId, epId), true);

      const removed = service.toggleSaveEpisode(userId, epId);
      assert.equal(removed, false);
      assert.equal(service.isEpisodeSaved(userId, epId), false);
    });

    test('Saved episodes are strictly isolated between listeners', () => {
      const userA = 'usr-listener-a';
      const userB = 'usr-listener-b';
      const epId = 'ep-isaiah-40';

      service.toggleSaveEpisode(userA, epId);
      assert.equal(service.isEpisodeSaved(userA, epId), true);
      assert.equal(service.isEpisodeSaved(userB, epId), false);
    });
  });

  describe('Listening Progress & Completion Threshold', () => {
    const userId = 'usr-listener-1';
    const epId = 'ep-forge-podcast-01';
    const durationSeconds = 3000; // 50 minutes

    test('Records mid-episode playback position (e.g. 15 minutes in)', () => {
      const progress = service.recordProgress(userId, epId, 900, durationSeconds);
      assert.equal(progress.positionSeconds, 900);
      assert.equal(progress.durationSeconds, 3000);
      assert.equal(progress.completed, false);
    });

    test('Marks episode as completed when past 90% threshold', () => {
      // 2750s / 3000s = 91.6% > 90%
      const progress = service.recordProgress(userId, epId, 2750, durationSeconds);
      assert.equal(progress.positionSeconds, 2750);
      assert.equal(progress.completed, true);
    });

    test('Retrieves stored progress for resumption', () => {
      const retrieved = service.getProgress(userId, epId);
      assert.notEqual(retrieved, null);
      assert.equal(retrieved.positionSeconds, 2750);
      assert.equal(retrieved.completed, true);
    });
  });

  describe('Playlist Ordering & Reordering', () => {
    const userId = 'usr-listener-1';

    test('Creates custom playlist and adds items with incremental position indices', () => {
      const pl = service.createPlaylist(userId, 'Morning Devotions');
      service.addPlaylistItem(pl.id, 'ep-1');
      service.addPlaylistItem(pl.id, 'ep-2');
      service.addPlaylistItem(pl.id, 'ep-3');

      assert.equal(pl.items.length, 3);
      assert.equal(pl.items[0].episodeId, 'ep-1');
      assert.equal(pl.items[0].position, 0);
      assert.equal(pl.items[2].episodeId, 'ep-3');
      assert.equal(pl.items[2].position, 2);
    });

    test('Reorders playlist items and recalculates sequential positions', () => {
      const pl = Array.from(service.playlists.values())[0];
      // Move 'ep-3' (index 2) to front (index 0)
      service.reorderPlaylist(pl.id, 2, 0);

      assert.equal(pl.items[0].episodeId, 'ep-3');
      assert.equal(pl.items[0].position, 0);
      assert.equal(pl.items[1].episodeId, 'ep-1');
      assert.equal(pl.items[1].position, 1);
      assert.equal(pl.items[2].episodeId, 'ep-2');
      assert.equal(pl.items[2].position, 2);
    });
  });
});
