import axios from 'axios';
import path from 'path';
import process from 'process';

// Configure S3 client for Digital Ocean Spaces
// These values should be in your .env file
const spacesEndpoint = process.env.DO_SPACES_ENDPOINT || 'tor1.digitaloceanspaces.com';
const spacesBucket = process.env.DO_SPACES_BUCKET || 'd4lcdn';
const spacesAccessKey = process.env.DO_SPACES_ACCESS_KEY;
const spacesSecretKey = process.env.DO_SPACES_SECRET_KEY;
const spacesUrl = process.env.DO_SPACES_URL || `https://${spacesBucket}.${spacesEndpoint}`;
const spacesCdnUrl = process.env.DO_SPACES_CDN_URL || `https://${spacesBucket}.tor1.cdn.digitaloceanspaces.com`;

// Interface for uploaded file info
interface UploadedFileInfo {
  key: string;
  size: number;
  url: string;
  cdnUrl: string;
  contentType: string;
}

// Interface for upload options
interface UploadOptions {
  contentType?: string;
  isPublic?: boolean;
  folder?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
}

// Interface for list files response
interface ListFilesResponse {
  Key: string;
  Size: number;
  LastModified: string;
  ETag: string;
  StorageClass: string;
}

// Generate a unique key for the file
export const generateKey = (fileName: string, folder?: string): string => {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 15);
  const baseName = path.basename(fileName);
  const ext = path.extname(fileName);
  const name = path.basename(fileName, ext);
  
  return `${folder ? `${folder}/` : ''}${name}-${timestamp}-${random}${ext}`;
};

// Get CDN URL for a key
export const getCdnUrl = (key: string): string => {
  return `${process.env.DO_SPACES_CDN_URL || ''}/${key}`;
};

// Get direct Space URL for a key
export const getSpaceUrl = (key: string): string => {
  return `${process.env.DO_SPACES_URL || ''}/${key}`;
};

// Upload a file via API
export const uploadFile = async (
  filePath: string,
  options: UploadOptions = {}
): Promise<UploadedFileInfo> => {
  const file = await fetch(filePath);
  const data = await file.arrayBuffer();
  const key = generateKey(filePath, options.folder);

  try {
    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'upload',
        key,
        data: Array.from(new Uint8Array(data)),
        options
      })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error('Upload failed');
    }

    return {
      key,
      size: data.byteLength,
      url: getSpaceUrl(key),
      cdnUrl: getCdnUrl(key),
      contentType: options.contentType || 'application/octet-stream'
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Delete a file via API
export const deleteFile = async (key: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/storage/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'delete',
        key
      })
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Check if a file exists via API
export const fileExists = async (key: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/storage/exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'exists',
        key
      })
    });

    const result = await response.json();
    return result.exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    throw error;
  }
};

// List files in a folder
export const listFiles = async (prefix: string = '', maxKeys: number = 1000): Promise<ListFilesResponse[]> => {
  try {
    const response = await fetch('/api/storage/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'list',
        prefix,
        maxKeys
      })
    });

    const result = await response.json();
    return result.files || [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Upload a buffer to Digital Ocean Spaces
export const uploadBuffer = async (
  buffer: Buffer,
  fileName: string,
  options: UploadOptions = {}
): Promise<UploadedFileInfo> => {
  try {
    // Generate a unique key
    const key = generateKey(fileName, options.folder);
    
    // Determine content type
    const contentType = options.contentType || 'application/octet-stream';
    
    // Default cache control
    const cacheControl = options.cacheControl || 'public, max-age=31536000'; // 1 year by default
    
    // Upload parameters
    const headers = {
      'Content-Type': contentType,
      'Content-Length': buffer.length.toString(),
      'Cache-Control': cacheControl,
    };
    
    if (options.isPublic !== false) {
      headers['x-amz-acl'] = 'public-read';
    }
    
    if (options.metadata) {
      Object.keys(options.metadata).forEach((key) => {
        headers[`x-amz-meta-${key}`] = options.metadata[key];
      });
    }
    
    // Upload buffer
    const response = await axios.put(`https://${spacesEndpoint}/${spacesBucket}/${key}`, buffer, {
      headers,
    });
    
    // Return uploaded file info
    return {
      key: response.data.Key,
      size: buffer.length,
      url: `${spacesUrl}/${response.data.Key}`,
      cdnUrl: `${spacesCdnUrl}/${response.data.Key}`,
      contentType,
    };
  } catch (error) {
    console.error('Error uploading buffer to DO Spaces:', error);
    throw error;
  }
};

// Get a signed URL for a private file
export const getSignedUrl = (key: string, expiresInSeconds: number = 3600): string => {
  try {
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const signature = Buffer.from(`GET\n\n\n${expires}\n/${spacesBucket}/${key}`).toString('base64');
    const encodedSignature = encodeURIComponent(signature);
    
    return `https://${spacesEndpoint}/${spacesBucket}/${key}?AWSAccessKeyId=${spacesAccessKey}&Expires=${expires}&Signature=${encodedSignature}`;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// Get a file's metadata
export const getFileMetadata = async (key: string): Promise<any> => {
  try {
    const response = await axios.head(`https://${spacesEndpoint}/${spacesBucket}/${key}`, {
      headers: {
        'Authorization': `AWS ${spacesAccessKey}:${spacesSecretKey}`,
      },
    });
    
    return response.headers;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
};
