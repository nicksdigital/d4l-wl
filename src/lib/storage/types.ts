/**
 * Common types for storage operations
 */

/**
 * Interface for uploaded file info
 */
export interface UploadedFileInfo {
  key: string;
  size: number;
  url: string;
  cdnUrl: string;
  contentType: string;
}

/**
 * Interface for upload options
 */
export interface UploadOptions {
  contentType?: string;
  isPublic?: boolean;
  folder?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
}

/**
 * Interface for file metadata
 */
export interface FileMetadata {
  key: string;
  size: number;
  lastModified: Date;
  contentType: string;
  metadata: Record<string, string>;
}

/**
 * Interface for listing files options
 */
export interface ListFilesOptions {
  prefix?: string;
  maxKeys?: number;
  delimiter?: string;
  marker?: string;
}

/**
 * Interface for file listing result
 */
export interface FileListResult {
  files: FileInfo[];
  commonPrefixes?: string[];
  isTruncated: boolean;
  nextMarker?: string;
}

/**
 * Interface for basic file information
 */
export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  url: string;
  cdnUrl: string;
}

/**
 * Interface for file upload progress
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
