"use client";

import { useState, useCallback } from 'react';
import { UPLOAD_FOLDERS, MAX_FILE_SIZES, ALLOWED_EXTENSIONS } from '@/lib/constants';

interface UploadOptions {
  folder?: string;
  maxSize?: number;
  allowedExtensions?: string[];
  isPublic?: boolean;
}

interface UploadResult {
  key: string;
  url: string;
  cdnUrl: string;
  size: number;
  contentType: string;
}

interface UseFileUploadReturn {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadFile: (file: File, options?: UploadOptions) => Promise<UploadResult | null>;
  resetState: () => void;
}

/**
 * Custom hook for uploading files to DigitalOcean Spaces
 */
export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Reset the upload state
   */
  const resetState = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);
  
  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file: File, options?: UploadOptions): string | null => {
    // Check file size
    const maxSize = options?.maxSize || MAX_FILE_SIZES.MEDIA;
    if (file.size > maxSize) {
      return `File size exceeds the limit of ${Math.round(maxSize / (1024 * 1024))}MB`;
    }
    
    // Check file extension
    if (options?.allowedExtensions && options.allowedExtensions.length > 0) {
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!options.allowedExtensions.includes(fileExt)) {
        return `Invalid file type. Allowed extensions: ${options.allowedExtensions.join(', ')}`;
      }
    }
    
    return null;
  }, []);
  
  /**
   * Upload a file to DigitalOcean Spaces
   */
  const uploadFile = useCallback(async (
    file: File,
    options?: UploadOptions
  ): Promise<UploadResult | null> => {
    try {
      // Reset state
      resetState();
      
      // Validate file
      const validationError = validateFile(file, options);
      if (validationError) {
        setError(validationError);
        return null;
      }
      
      // Set uploading state
      setIsUploading(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Set folder
      const folder = options?.folder || UPLOAD_FOLDERS.MEDIA;
      formData.append('folder', folder);
      
      // Set public flag
      const isPublic = options?.isPublic !== false;
      formData.append('isPublic', isPublic.toString());
      
      // Create a custom fetch with upload progress tracking
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            reject(new Error(`HTTP error ${xhr.status}: ${xhr.statusText}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });
        
        xhr.open('POST', '/api/upload/spaces');
        xhr.send(formData);
      });
      
      // Wait for upload to complete
      const result = await uploadPromise;
      
      // Set progress to 100%
      setProgress(100);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [resetState, validateFile]);
  
  return {
    isUploading,
    progress,
    error,
    uploadFile,
    resetState,
  };
}

export default useFileUpload;
