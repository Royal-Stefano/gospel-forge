export type MediaType = "audio" | "artwork" | "banner";

export interface PresignedUploadRequest {
  fileName: string;
  fileSizeBytes: number;
  contentType: string;
  mediaType: MediaType;
  userId: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
  headers: Record<string, string>;
  publicDeliveryUrl: string;
}

export interface MultipartUploadInitResponse {
  uploadId: string;
  storageKey: string;
  partSize: number;
}

export interface StorageAdapter {
  generatePresignedUploadUrl(
    request: PresignedUploadRequest
  ): Promise<PresignedUploadResponse>;

  getPublicDeliveryUrl(storageKey: string): string;

  deleteObject(storageKey: string): Promise<boolean>;

  validateAudioBuffer(buffer: Buffer): { valid: boolean; error?: string };

  validateImageBuffer(buffer: Buffer): { valid: boolean; error?: string };
}

export const STORAGE_LIMITS = {
  AUDIO_MAX_BYTES: 500 * 1024 * 1024, // 500 MB
  ARTWORK_MAX_BYTES: 10 * 1024 * 1024, // 10 MB
  BANNER_MAX_BYTES: 10 * 1024 * 1024, // 10 MB
  ALLOWED_AUDIO_MIME_TYPES: [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/x-m4a",
    "audio/mp4",
    "audio/aac",
  ],
  ALLOWED_IMAGE_MIME_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
};
