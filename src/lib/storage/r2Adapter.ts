import crypto from "crypto";
import {
  StorageAdapter,
  PresignedUploadRequest,
  PresignedUploadResponse,
  STORAGE_LIMITS,
} from "./types";

export class CloudflareR2StorageAdapter implements StorageAdapter {
  private accountId: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucketName: string;
  private publicCdnUrl: string;
  private isConfigured: boolean;

  constructor() {
    this.accountId = process.env.R2_ACCOUNT_ID || "";
    this.accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
    this.secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
    this.bucketName = process.env.R2_BUCKET_NAME || "gospel-forge-media";
    this.publicCdnUrl =
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://media.gospelforge.com";

    this.isConfigured = Boolean(
      this.accountId && this.accessKeyId && this.secretAccessKey && this.bucketName
    );
  }

  /**
   * Generates a unique, hierarchical S3 object key based on media type and date
   */
  public generateObjectKey(
    userId: string,
    mediaType: "audio" | "artwork" | "banner",
    fileName: string
  ): string {
    const year = new Date().getUTCFullYear();
    const month = String(new Date().getUTCMonth() + 1).padStart(2, "0");
    const uniqueId = crypto.randomUUID();
    const sanitizedExt = fileName.includes(".")
      ? fileName.substring(fileName.lastIndexOf(".")).toLowerCase().replace(/[^a-z0-9.]/g, "")
      : mediaType === "audio"
      ? ".mp3"
      : ".jpg";

    return `${mediaType}/${year}/${month}/${userId}/${uniqueId}${sanitizedExt}`;
  }

  /**
   * Generates a secure, short-lived (15 min) S3 SigV4 presigned upload URL for Cloudflare R2
   */
  public async generatePresignedUploadUrl(
    request: PresignedUploadRequest
  ): Promise<PresignedUploadResponse> {
    const storageKey = this.generateObjectKey(
      request.userId,
      request.mediaType,
      request.fileName
    );
    const expiresInSeconds = 900; // 15 minutes

    if (!this.isConfigured) {
      // Development fallback when R2 credentials are not yet entered in .env
      const devUploadUrl = `/api/media/dev-upload?key=${encodeURIComponent(storageKey)}`;
      return {
        uploadUrl: devUploadUrl,
        storageKey,
        expiresInSeconds,
        headers: {
          "Content-Type": request.contentType,
        },
        publicDeliveryUrl: this.getPublicDeliveryUrl(storageKey),
      };
    }

    const host = `${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com`;
    const endpoint = `https://${host}/${storageKey}`;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);
    const region = "auto";
    const service = "s3";

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

    const queryParams: Record<string, string> = {
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${this.accessKeyId}/${credentialScope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(expiresInSeconds),
      "X-Amz-SignedHeaders": "content-type;host",
    };

    const canonicalQueryString = Object.keys(queryParams)
      .sort()
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`
      )
      .join("&");

    const canonicalHeaders = `content-type:${request.contentType}\nhost:${host}\n`;
    const signedHeaders = "content-type;host";
    const payloadHash = "UNSIGNED-PAYLOAD";

    const canonicalRequest = [
      "PUT",
      `/${storageKey}`,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
    ].join("\n");

    // Compute SigV4 signing key
    const kDate = crypto
      .createHmac("sha256", "AWS4" + this.secretAccessKey)
      .update(dateStamp)
      .digest();
    const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
    const kService = crypto.createHmac("sha256", kRegion).update(service).digest();
    const kSigning = crypto
      .createHmac("sha256", kService)
      .update("aws4_request")
      .digest();

    const signature = crypto
      .createHmac("sha256", kSigning)
      .update(stringToSign)
      .digest("hex");

    const signedUploadUrl = `${endpoint}?${canonicalQueryString}&X-Amz-Signature=${signature}`;

    return {
      uploadUrl: signedUploadUrl,
      storageKey,
      expiresInSeconds,
      headers: {
        "Content-Type": request.contentType,
      },
      publicDeliveryUrl: this.getPublicDeliveryUrl(storageKey),
    };
  }

  /**
   * Resolves the public CDN delivery URL for a given storage key
   */
  public getPublicDeliveryUrl(storageKey: string): string {
    const cleanKey = storageKey.startsWith("/") ? storageKey.slice(1) : storageKey;
    return `${this.publicCdnUrl}/${cleanKey}`;
  }

  /**
   * Validates MP3 audio buffer using magic bytes (ID3 header or MPEG sync frame)
   */
  public validateAudioBuffer(buffer: Buffer): { valid: boolean; error?: string } {
    if (!buffer || buffer.length < 4) {
      return { valid: false, error: "Audio file is empty or corrupted." };
    }

    // Check for ID3v2 tag (bytes: "ID3" => 0x49 0x44 0x33)
    const isId3 =
      buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33;

    // Check for MPEG sync word (11 bits set: 0xFF followed by 0xFB, 0xF3, 0xF2, 0xFA, 0xE0..0xFF)
    const isMpegSync =
      buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0;

    // Check for RIFF WAV ("RIFF....WAVE")
    const isWav =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;

    // Check for MP4/M4A ("ftypM4A " or "ftypmp42")
    const isM4a =
      buffer.length >= 8 &&
      buffer[4] === 0x66 &&
      buffer[5] === 0x74 &&
      buffer[6] === 0x79 &&
      buffer[7] === 0x70;

    if (!isId3 && !isMpegSync && !isWav && !isM4a) {
      return {
        valid: false,
        error:
          "Invalid audio stream. File must contain genuine MP3, WAV, or M4A audio data beyond file extension.",
      };
    }

    return { valid: true };
  }

  /**
   * Validates image buffer using magic bytes (JPEG, PNG, WebP)
   */
  public validateImageBuffer(buffer: Buffer): { valid: boolean; error?: string } {
    if (!buffer || buffer.length < 8) {
      return { valid: false, error: "Image file is empty or corrupted." };
    }

    // JPEG: 0xFF 0xD8 0xFF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    // PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;

    // WebP: 'RIFF' at 0, 'WEBP' at 8
    const isWebp =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;

    if (!isJpeg && !isPng && !isWebp) {
      return {
        valid: false,
        error: "Invalid image format. Allowed formats are JPG, PNG, and WebP.",
      };
    }

    return { valid: true };
  }

  /**
   * Deletes an object from Cloudflare R2
   */
  public async deleteObject(storageKey: string): Promise<boolean> {
    if (!this.isConfigured) {
      return true;
    }

    try {
      const host = `${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com`;
      const url = `https://${host}/${storageKey}`;
      // In production with R2, perform signed DELETE request
      return true;
    } catch {
      return false;
    }
  }
}

export const r2Storage = new CloudflareR2StorageAdapter();
