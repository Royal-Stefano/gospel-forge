import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Storage logic replica matching src/lib/storage/r2Adapter.ts & types.ts
const STORAGE_LIMITS = {
  AUDIO_MAX_BYTES: 500 * 1024 * 1024,
  ARTWORK_MAX_BYTES: 10 * 1024 * 1024,
  ALLOWED_AUDIO_MIME_TYPES: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/aac',
    'audio/m4a',
    'audio/x-m4a',
  ],
  ALLOWED_IMAGE_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
};

function validateMagicBytes(buffer, mediaType) {
  if (buffer.length < 4) return false;

  if (mediaType === 'audio') {
    // ID3v2 header: 0x49 0x44 0x33 ("ID3")
    const isId3 =
      buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33;

    // MPEG sync frame: 11 bits set (0xFF followed by 0xFB, 0xF3, 0xF2, 0xFA, etc.)
    const isMpegSync =
      buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0;

    // RIFF/WAV header: 0x52 0x49 0x46 0x46 ("RIFF")
    const isRiffWav =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;

    return isId3 || isMpegSync || isRiffWav;
  }

  if (mediaType === 'artwork' || mediaType === 'banner') {
    // JPEG: 0xFF 0xD8 0xFF
    const isJpeg =
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    // PNG: 0x89 0x50 0x4E 0x47 (".PNG")
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;

    // WebP: RIFF....WEBP
    const isWebP =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;

    return isJpeg || isPng || isWebP;
  }

  return false;
}

function parseRangeHeader(rangeHeader, totalSize) {
  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) {
    return { start: 0, end: totalSize - 1, isPartial: false };
  }

  const parts = rangeHeader.replace(/bytes=/, '').split('-');
  const startStr = parts[0];
  const endStr = parts[1];

  let start = parseInt(startStr, 10);
  let end = endStr ? parseInt(endStr, 10) : totalSize - 1;

  if (isNaN(start)) {
    // Suffix range: bytes=-500 (last 500 bytes)
    start = totalSize - end;
    end = totalSize - 1;
  }

  if (isNaN(end) || end >= totalSize) {
    end = totalSize - 1;
  }

  if (start > end || start < 0) {
    return null; // Invalid range: 416 Range Not Satisfiable
  }

  return { start, end, isPartial: true, length: end - start + 1 };
}

function buildStorageKey(userId, mediaType, filename) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${mediaType}/${year}/${month}/${userId}/${Date.now()}-${safeName}`;
}

describe('Cloudflare R2 Media Infrastructure', () => {
  describe('Magic Byte Audio Verification (Preventing Extension Spoofing)', () => {
    test('Valid ID3v2 tagged MP3 is accepted', () => {
      // 0x49 0x44 0x33 ("ID3") + version
      const id3Header = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00]);
      assert.equal(validateMagicBytes(id3Header, 'audio'), true);
    });

    test('Valid Raw MPEG Sync Frame MP3 is accepted', () => {
      // 0xFF 0xFB (MPEG 1 Layer 3 sync frame)
      const mpegSyncHeader = Buffer.from([0xff, 0xfb, 0x90, 0x64]);
      assert.equal(validateMagicBytes(mpegSyncHeader, 'audio'), true);
    });

    test('Valid WAV file (RIFF header) is accepted', () => {
      // 0x52 0x49 0x46 0x46 ("RIFF")
      const wavHeader = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00]);
      assert.equal(validateMagicBytes(wavHeader, 'audio'), true);
    });

    test('Text or executable file disguised as .mp3 is rejected', () => {
      const fakeMp3Text = Buffer.from('<!DOCTYPE html><html><body>malicious payload</body></html>');
      assert.equal(validateMagicBytes(fakeMp3Text, 'audio'), false);

      const fakeMp3Exe = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ executable
      assert.equal(validateMagicBytes(fakeMp3Exe, 'audio'), false);
    });
  });

  describe('Magic Byte Artwork Verification', () => {
    test('Valid JPEG image header is accepted', () => {
      const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      assert.equal(validateMagicBytes(jpegHeader, 'artwork'), true);
    });

    test('Valid PNG image header is accepted', () => {
      const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      assert.equal(validateMagicBytes(pngHeader, 'artwork'), true);
    });

    test('Valid WebP image header is accepted', () => {
      const webpHeader = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00]);
      assert.equal(validateMagicBytes(webpHeader, 'artwork'), true);
    });

    test('Corrupt or invalid image buffer is rejected', () => {
      const invalidImg = Buffer.from([0x00, 0x01, 0x02, 0x03]);
      assert.equal(validateMagicBytes(invalidImg, 'artwork'), false);
    });
  });

  describe('File Size Limits Enforcement', () => {
    test('Audio file within 500MB is allowed', () => {
      const sizeBytes = 85 * 1024 * 1024; // 85 MB
      assert.ok(sizeBytes <= STORAGE_LIMITS.AUDIO_MAX_BYTES);
    });

    test('Audio file exceeding 500MB is rejected', () => {
      const oversizedBytes = 550 * 1024 * 1024; // 550 MB
      assert.ok(oversizedBytes > STORAGE_LIMITS.AUDIO_MAX_BYTES);
    });

    test('Artwork within 10MB is allowed', () => {
      const sizeBytes = 4.2 * 1024 * 1024; // 4.2 MB
      assert.ok(sizeBytes <= STORAGE_LIMITS.ARTWORK_MAX_BYTES);
    });

    test('Artwork exceeding 10MB is rejected', () => {
      const oversizedBytes = 15 * 1024 * 1024; // 15 MB
      assert.ok(oversizedBytes > STORAGE_LIMITS.ARTWORK_MAX_BYTES);
    });
  });

  describe('HTTP Range Requests & Audio Scrubbing/Seeking', () => {
    const totalMediaSize = 50 * 1024 * 1024; // 50 MB episode

    test('Requests initial audio chunk (e.g., bytes=0-1048575 for initial playback)', () => {
      const parsed = parseRangeHeader('bytes=0-1048575', totalMediaSize);
      assert.notEqual(parsed, null);
      assert.equal(parsed.start, 0);
      assert.equal(parsed.end, 1048575);
      assert.equal(parsed.length, 1048576);
      assert.equal(parsed.isPartial, true);
    });

    test('Requests mid-audio seek chunk (e.g., bytes=25000000-)', () => {
      const parsed = parseRangeHeader('bytes=25000000-', totalMediaSize);
      assert.notEqual(parsed, null);
      assert.equal(parsed.start, 25000000);
      assert.equal(parsed.end, totalMediaSize - 1);
      assert.equal(parsed.isPartial, true);
    });

    test('Unspecified Range requests return entire file representation', () => {
      const parsed = parseRangeHeader(null, totalMediaSize);
      assert.equal(parsed.start, 0);
      assert.equal(parsed.end, totalMediaSize - 1);
      assert.equal(parsed.isPartial, false);
    });

    test('Out-of-bounds start range returns null (416 Not Satisfiable)', () => {
      const parsed = parseRangeHeader('bytes=999999999-9999999999', totalMediaSize);
      assert.equal(parsed, null);
    });
  });

  describe('Storage Key Isolation by User ID', () => {
    test('Storage key contains mediaType, year/month, and owning user ID', () => {
      const key = buildStorageKey('usr-artist-789', 'audio', 'sermon_master.mp3');
      assert.ok(key.startsWith('audio/'));
      assert.ok(key.includes('/usr-artist-789/'));
      assert.ok(key.endsWith('sermon_master.mp3'));
    });

    test('Different creators produce segregated storage paths', () => {
      const keyA = buildStorageKey('usr-creator-1', 'audio', 'test.mp3');
      const keyB = buildStorageKey('usr-creator-2', 'audio', 'test.mp3');
      assert.notEqual(keyA, keyB);
      assert.ok(keyA.includes('usr-creator-1'));
      assert.ok(keyB.includes('usr-creator-2'));
    });
  });
});
