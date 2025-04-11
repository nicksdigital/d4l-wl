import AWS from 'aws-sdk';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';

// Configure S3 client for Digital Ocean Spaces
// These values should be in your .env file
const spacesEndpoint = process.env.DO_SPACES_ENDPOINT || 'tor1.digitaloceanspaces.com';
const spacesBucket = process.env.DO_SPACES_BUCKET || 'd4lcdn';
const spacesAccessKey = process.env.DO_SPACES_ACCESS_KEY;
const spacesSecretKey = process.env.DO_SPACES_SECRET_KEY;
const spacesUrl = process.env.DO_SPACES_URL || `https://${spacesBucket}.${spacesEndpoint}`;
const spacesCdnUrl = process.env.DO_SPACES_CDN_URL || `https://${spacesBucket}.tor1.cdn.digitaloceanspaces.com`;

// Initialize the S3 client
const s3 = new AWS.S3({
  endpoint: `https://${spacesEndpoint}`,
  accessKeyId: spacesAccessKey,
  secretAccessKey: spacesSecretKey,
  region: 'us-east-1', // This is required but doesn't matter for DO Spaces
  s3ForcePathStyle: false, // This is required for DO Spaces
});

/**
 * Interface for upload options
 */
interface UploadOptions {
  contentType?: string;
  isPublic?: boolean;
  folder?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
}

/**
 * Interface for uploaded file info
 */
interface UploadedFileInfo {
  key: string;
  size: number;
  url: string;
  cdnUrl: string;
  contentType: string;
}

/**
 * Generate a unique key for the file
 * @param fileName Original file name
 * @param folder Optional folder path
 */
const generateKey = (fileName: string, folder?: string): string => {
  const timestamp = Date.now();
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  const normalizedBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  
  const key = `${normalizedBaseName}-${timestamp}${extension}`;
  return folder ? `${folder}/${key}` : key;
};

/**
 * Guess content type from file extension
 * @param filePath Path to the file
 */
const guessContentType = (filePath: string): string => {
  const extension = path.extname(filePath).toLowerCase();
  
  const contentTypeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
  };

  return contentTypeMap[extension] || 'application/octet-stream';
};

/**
 * Upload a file to Digital Ocean Spaces
 * @param filePath Path to the file on disk
 * @param options Upload options
 */
export const uploadFile = async (
  filePath: string,
  options: UploadOptions = {}
): Promise<UploadedFileInfo> => {
  try {
    // Get file stats
    const fileStats = await stat(filePath);
    
    // Generate a unique key
    const key = generateKey(path.basename(filePath), options.folder);
    
    // Determine content type
    const contentType = options.contentType || guessContentType(filePath);
    
    // Default cache control
    const cacheControl = options.cacheControl || 'public, max-age=31536000'; // 1 year by default
    
    // Upload parameters
    const params: AWS.S3.PutObjectRequest = {
      Bucket: spacesBucket,
      Key: key,
      Body: createReadStream(filePath),
      ACL: options.isPublic !== false ? 'public-read' : 'private',
      ContentType: contentType,
      ContentLength: fileStats.size,
      CacheControl: cacheControl,
      Metadata: options.metadata,
    };
    
    // Upload file
    const result = await s3.upload(params).promise();
    
    // Return uploaded file info
    return {
      key: result.Key,
      size: fileStats.size,
      url: `${spacesUrl}/${result.Key}`,
      cdnUrl: `${spacesCdnUrl}/${result.Key}`,
      contentType,
    };
  } catch (error) {
    console.error('Error uploading file to DO Spaces:', error);
    throw error;
  }
};

/**
 * Upload a buffer to Digital Ocean Spaces
 * @param buffer Buffer to upload
 * @param fileName Name for the file
 * @param options Upload options
 */
export const uploadBuffer = async (
  buffer: Buffer,
  fileName: string,
  options: UploadOptions = {}
): Promise<UploadedFileInfo> => {
  try {
    // Generate a unique key
    const key = generateKey(fileName, options.folder);
    
    // Determine content type
    const contentType = options.contentType || guessContentType(fileName);
    
    // Default cache control
    const cacheControl = options.cacheControl || 'public, max-age=31536000'; // 1 year by default
    
    // Upload parameters
    const params: AWS.S3.PutObjectRequest = {
      Bucket: spacesBucket,
      Key: key,
      Body: buffer,
      ACL: options.isPublic !== false ? 'public-read' : 'private',
      ContentType: contentType,
      ContentLength: buffer.length,
      CacheControl: cacheControl,
      Metadata: options.metadata,
    };
    
    // Upload buffer
    const result = await s3.upload(params).promise();
    
    // Return uploaded file info
    return {
      key: result.Key,
      size: buffer.length,
      url: `${spacesUrl}/${result.Key}`,
      cdnUrl: `${spacesCdnUrl}/${result.Key}`,
      contentType,
    };
  } catch (error) {
    console.error('Error uploading buffer to DO Spaces:', error);
    throw error;
  }
};

/**
 * Delete a file from Digital Ocean Spaces
 * @param key Key of the file to delete
 */
export const deleteFile = async (key: string): Promise<boolean> => {
  try {
    await s3.deleteObject({
      Bucket: spacesBucket,
      Key: key,
    }).promise();
    
    return true;
  } catch (error) {
    console.error('Error deleting file from DO Spaces:', error);
    throw error;
  }
};

/**
 * List files in a folder
 * @param prefix Folder prefix
 * @param maxKeys Maximum number of keys to return
 */
export const listFiles = async (prefix: string = '', maxKeys: number = 1000): Promise<AWS.S3.ObjectList> => {
  try {
    const response = await s3.listObjects({
      Bucket: spacesBucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
    }).promise();
    
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing files in DO Spaces:', error);
    throw error;
  }
};

/**
 * Get a signed URL for a private file
 * @param key Key of the file
 * @param expiresInSeconds URL expiration time in seconds
 */
export const getSignedUrl = (key: string, expiresInSeconds: number = 3600): string => {
  try {
    const params = {
      Bucket: spacesBucket,
      Key: key,
      Expires: expiresInSeconds,
    };
    
    return s3.getSignedUrl('getObject', params);
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

/**
 * Get a file's metadata
 * @param key Key of the file
 */
export const getFileMetadata = async (key: string): Promise<AWS.S3.HeadObjectOutput> => {
  try {
    const response = await s3.headObject({
      Bucket: spacesBucket,
      Key: key,
    }).promise();
    
    return response;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
};

/**
 * Check if a file exists
 * @param key Key of the file
 */
export const fileExists = async (key: string): Promise<boolean> => {
  try {
    await s3.headObject({
      Bucket: spacesBucket,
      Key: key,
    }).promise();
    
    return true;
  } catch (error) {
    if ((error as AWS.AWSError).code === 'NotFound') {
      return false;
    }
    throw error;
  }
};

/**
 * Get CDN URL for a key
 * @param key Key of the file
 */
export const getCdnUrl = (key: string): string => {
  return `${spacesCdnUrl}/${key}`;
};

/**
 * Get direct Space URL for a key
 * @param key Key of the file
 */
export const getSpaceUrl = (key: string): string => {
  return `${spacesUrl}/${key}`;
};

// Export the S3 client for advanced usage
export { s3 };
