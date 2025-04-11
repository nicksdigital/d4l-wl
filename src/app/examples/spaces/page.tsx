"use client";

import React, { useState } from 'react';
import FileUploader from '@/components/common/FileUploader';
import OptimizedImage from '@/components/common/OptimizedImage';
import ResponsiveImage from '@/components/common/ResponsiveImage';
import { UPLOAD_FOLDERS, ALLOWED_EXTENSIONS, MAX_FILE_SIZES } from '@/lib/constants';
import { ImageOptimization } from '@/utils/imageUtils';

interface UploadedImage {
  key: string;
  cdnUrl: string;
}

export default function SpacesExamplePage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Handle successful upload
  const handleUploadComplete = (result: { key: string; url: string; cdnUrl: string }) => {
    setUploadedImages((prev) => [...prev, { key: result.key, cdnUrl: result.cdnUrl }]);
    setUploadError(null);
  };
  
  // Handle upload error
  const handleUploadError = (error: string) => {
    setUploadError(error);
  };
  
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">DigitalOcean Spaces CDN Example</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">Upload Images</h2>
        
        <FileUploader
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          folder={UPLOAD_FOLDERS.MEDIA}
          maxSize={MAX_FILE_SIZES.MEDIA}
          allowedExtensions={ALLOWED_EXTENSIONS.IMAGES}
          multiple={true}
          isPublic={true}
          className="mb-6"
          buttonLabel="Select Images"
          dragAreaLabel="or drag and drop images here"
          acceptedFileTypes="image/*"
        />
        
        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Upload failed</p>
            <p className="text-sm">{uploadError}</p>
          </div>
        )}
      </div>
      
      {uploadedImages.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4">Uploaded Images</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploadedImages.map((image, index) => (
              <div key={index} className="bg-gray-50 rounded-md p-4">
                <div className="mb-2 h-48 overflow-hidden rounded-md">
                  <OptimizedImage
                    src={image.key}
                    alt={`Uploaded image ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-full"
                    objectFit="cover"
                    optimization={ImageOptimization.MEDIUM}
                  />
                </div>
                <div className="text-sm text-gray-500 truncate">{image.key}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">Image Component Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* OptimizedImage examples */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">OptimizedImage Component</h3>
              <p className="text-gray-600 mb-4">Uses Next.js Image with DigitalOcean CDN URL transformation.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Original Image</h4>
              <div className="h-48 overflow-hidden rounded-md">
                <OptimizedImage
                  src="examples/sample-image.jpg"
                  alt="Sample image - original"
                  width={800}
                  height={600}
                  className="w-full h-full"
                  objectFit="cover"
                  optimization={ImageOptimization.ORIGINAL}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Thumbnail (200px width)</h4>
              <div className="h-48 overflow-hidden rounded-md">
                <OptimizedImage
                  src="examples/sample-image.jpg"
                  alt="Sample image - thumbnail"
                  width={200}
                  height={150}
                  className="w-full h-full"
                  objectFit="cover"
                  optimization={ImageOptimization.THUMBNAIL}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">WebP Format (90% quality)</h4>
              <div className="h-48 overflow-hidden rounded-md">
                <OptimizedImage
                  src="examples/sample-image.jpg"
                  alt="Sample image - WebP"
                  width={400}
                  height={300}
                  className="w-full h-full"
                  objectFit="cover"
                  optimization={ImageOptimization.WEBP}
                />
              </div>
            </div>
          </div>
          
          {/* ResponsiveImage examples */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">ResponsiveImage Component</h3>
              <p className="text-gray-600 mb-4">Uses HTML picture element with multiple sources for different devices and formats.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Responsive with WebP and original formats</h4>
              <div className="h-48 overflow-hidden rounded-md">
                <ResponsiveImage
                  src="examples/sample-image.jpg"
                  alt="Sample responsive image"
                  className="w-full h-full object-cover"
                  widths={[400, 600, 800, 1200]}
                  formats={['webp', 'original']}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Responsive with AVIF, WebP and original formats</h4>
              <div className="h-48 overflow-hidden rounded-md">
                <ResponsiveImage
                  src="examples/sample-image.jpg"
                  alt="Sample responsive image with AVIF"
                  className="w-full h-full object-cover"
                  widths={[400, 600, 800, 1200]}
                  formats={['avif', 'webp', 'original']}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Usage Information</h2>
        
        <div className="prose max-w-none">
          <h3>How to Use</h3>
          <p>
            This example demonstrates integration with DigitalOcean Spaces CDN for optimized image delivery.
            All uploaded files are stored in DigitalOcean Spaces and served through the CDN at
            <code>https://d4lcdn.tor1.cdn.digitaloceanspaces.com</code>.
          </p>
          
          <h3>File Upload</h3>
          <p>
            Use the <code>FileUploader</code> component to handle file uploads. It supports:
          </p>
          <ul>
            <li>Drag and drop</li>
            <li>File type validation</li>
            <li>Size restrictions</li>
            <li>Upload progress</li>
            <li>Error handling</li>
          </ul>
          
          <h3>Image Components</h3>
          <p>The library provides two image components:</p>
          
          <h4>OptimizedImage</h4>
          <p>
            Extends Next.js Image component with automatic DigitalOcean Spaces CDN support.
            It handles blur placeholders, image transformations, and format conversions.
          </p>
          <pre><code>{`<OptimizedImage
  src="path/to/image.jpg"  // Key in DO Spaces or full URL
  alt="Description"
  width={400}
  height={300}
  optimization={ImageOptimization.WEBP}
/>`}</code></pre>
          
          <h4>ResponsiveImage</h4>
          <p>
            Uses the HTML picture element to provide different image formats and sizes
            based on the device, screen size, and browser support.
          </p>
          <pre><code>{`<ResponsiveImage
  src="path/to/image.jpg"  // Key in DO Spaces or full URL
  alt="Description"
  widths={[400, 800, 1200]}
  formats={['avif', 'webp', 'original']}
/>`}</code></pre>
        </div>
      </div>
    </div>
  );
}
