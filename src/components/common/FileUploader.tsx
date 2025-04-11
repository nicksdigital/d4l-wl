"use client";

import React, { useState, useRef, useCallback } from 'react';
import useFileUpload from '@/hooks/useFileUpload';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZES, UPLOAD_FOLDERS } from '@/lib/constants';

interface FileUploaderProps {
  onUploadComplete?: (result: { key: string; url: string; cdnUrl: string }) => void;
  onUploadError?: (error: string) => void;
  folder?: string;
  maxSize?: number;
  allowedExtensions?: string[];
  multiple?: boolean;
  isPublic?: boolean;
  className?: string;
  buttonLabel?: string;
  dragAreaLabel?: string;
  acceptedFileTypes?: string;
}

export default function FileUploader({
  onUploadComplete,
  onUploadError,
  folder = UPLOAD_FOLDERS.MEDIA,
  maxSize = MAX_FILE_SIZES.MEDIA,
  allowedExtensions = ALLOWED_EXTENSIONS.IMAGES,
  multiple = false,
  isPublic = true,
  className = '',
  buttonLabel = 'Select File',
  dragAreaLabel = 'or drag and drop file here',
  acceptedFileTypes = 'image/*',
}: FileUploaderProps) {
  const { isUploading, progress, error, uploadFile, resetState } = useFileUpload();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file upload
  const handleUpload = useCallback(async (file: File) => {
    const result = await uploadFile(file, {
      folder,
      maxSize,
      allowedExtensions,
      isPublic,
    });
    
    if (result) {
      onUploadComplete?.({
        key: result.key,
        url: result.url,
        cdnUrl: result.cdnUrl,
      });
    } else if (error) {
      onUploadError?.(error);
    }
  }, [uploadFile, folder, maxSize, allowedExtensions, isPublic, onUploadComplete, onUploadError, error]);
  
  // Handle file input change
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    if (multiple) {
      Array.from(files).forEach(handleUpload);
    } else {
      handleUpload(files[0]);
    }
    
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleUpload, multiple]);
  
  // Handle button click
  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    if (multiple) {
      Array.from(files).forEach(handleUpload);
    } else {
      handleUpload(files[0]);
    }
  }, [handleUpload, multiple]);
  
  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        multiple={multiple}
      />
      
      {/* Drag area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {isUploading ? (
          <div className="w-full">
            <p className="text-gray-600 mb-2">Uploading... {progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            >
              {buttonLabel}
            </button>
            <p className="mt-2 text-sm text-gray-500">{dragAreaLabel}</p>
            
            {/* File restrictions info */}
            <p className="mt-1 text-xs text-gray-400">
              {allowedExtensions.join(', ')} · Max {Math.round(maxSize / (1024 * 1024))}MB
            </p>
            
            {/* Error message */}
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
