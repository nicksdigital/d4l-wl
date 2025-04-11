# DigitalOcean Spaces Integration for D4L

This guide outlines how to use DigitalOcean Spaces CDN for asset hosting and delivery in the D4L application.

## Setup and Configuration

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```
# DigitalOcean Spaces Configuration
DO_SPACES_ENDPOINT=tor1.digitaloceanspaces.com
DO_SPACES_BUCKET=d4lcdn
DO_SPACES_ACCESS_KEY=your_access_key_here
DO_SPACES_SECRET_KEY=your_secret_key_here
DO_SPACES_URL=https://d4lcdn.tor1.digitaloceanspaces.com
DO_SPACES_CDN_URL=https://d4lcdn.tor1.cdn.digitaloceanspaces.com
```

### 2. Dependencies

The integration uses AWS SDK for S3-compatible storage:

```bash
npm install aws-sdk
```

This dependency is already included in the package.json.

## Usage Examples

### Uploading Files

```typescript
import { uploadFile, uploadBuffer } from '@/lib/storage';

// Upload a file from disk
const result = await uploadFile('/path/to/local/file.jpg', {
  folder: 'images',
  isPublic: true,
  metadata: { userId: 'user123' },
});

// Upload a buffer (for example, from form data)
const buffer = await file.arrayBuffer();
const result = await uploadBuffer(Buffer.from(buffer), 'filename.jpg', {
  folder: 'uploads',
  contentType: 'image/jpeg',
});

console.log(result);
// {
//   key: 'images/filename-1234567890.jpg',
//   size: 12345,
//   url: 'https://d4lcdn.tor1.digitaloceanspaces.com/images/filename-1234567890.jpg',
//   cdnUrl: 'https://d4lcdn.tor1.cdn.digitaloceanspaces.com/images/filename-1234567890.jpg',
//   contentType: 'image/jpeg'
// }
```

### Using Image Components

#### OptimizedImage Component

```tsx
import OptimizedImage from '@/components/common/OptimizedImage';
import { ImageOptimization } from '@/utils/imageUtils';

// Basic usage
<OptimizedImage
  src="path/to/image.jpg"
  alt="Description"
  width={400}
  height={300}
/>

// With optimization
<OptimizedImage
  src="path/to/image.jpg"
  alt="Description"
  width={400}
  height={300}
  optimization={ImageOptimization.WEBP}
  quality={90}
  objectFit="cover"
/>
```

#### ResponsiveImage Component

```tsx
import ResponsiveImage from '@/components/common/ResponsiveImage';

<ResponsiveImage
  src="path/to/image.jpg"
  alt="Description"
  widths={[400, 800, 1200]}
  formats={['avif', 'webp', 'original']}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### File Uploader Component

```tsx
import FileUploader from '@/components/common/FileUploader';
import { UPLOAD_FOLDERS, ALLOWED_EXTENSIONS, MAX_FILE_SIZES } from '@/lib/constants';

<FileUploader
  onUploadComplete={(result) => console.log(result)}
  onUploadError={(error) => console.error(error)}
  folder={UPLOAD_FOLDERS.MEDIA}
  maxSize={MAX_FILE_SIZES.MEDIA}
  allowedExtensions={ALLOWED_EXTENSIONS.IMAGES}
  multiple={true}
  isPublic={true}
  buttonLabel="Select Files"
  dragAreaLabel="or drag and drop files here"
/>
```

### API Routes

The integration includes an API route at `/api/upload/spaces` to handle file uploads from the client:

```typescript
// Client-side upload example
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'uploads');
  formData.append('isPublic', 'true');
  
  const response = await fetch('/api/upload/spaces', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  return result;
};
```

## Additional Utilities

### Image Optimization

The `imageUtils.ts` file provides helpers for generating optimized image URLs:

```typescript
import { getOptimizedImageUrl, ImageOptimization } from '@/utils/imageUtils';

// Generate a URL for a WebP version of an image
const webpUrl = getOptimizedImageUrl(
  'path/to/image.jpg',
  ImageOptimization.WEBP,
  { width: 800, height: 600 }
);

// Generate a thumbnail URL
const thumbnailUrl = getOptimizedImageUrl(
  'path/to/image.jpg',
  ImageOptimization.THUMBNAIL
);

// Generate a blur placeholder URL
import { getBlurHashUrl } from '@/utils/imageUtils';
const blurUrl = getBlurHashUrl('path/to/image.jpg');
```

### Other Storage Operations

```typescript
import {
  deleteFile,
  listFiles,
  getSignedUrl,
  fileExists,
  getFileMetadata
} from '@/lib/storage';

// Delete a file
await deleteFile('path/to/file.jpg');

// List files in a folder
const files = await listFiles('images/', 100);

// Generate a signed URL for private files
const signedUrl = getSignedUrl('private/file.pdf', 3600); // 1 hour expiry

// Check if a file exists
const exists = await fileExists('path/to/file.jpg');

// Get file metadata
const metadata = await getFileMetadata('path/to/file.jpg');
```

## Best Practices

1. **Folder Structure**: Organize files logically using the predefined folders in `UPLOAD_FOLDERS`.

2. **File Validation**: Always validate file types and sizes before uploading.

3. **Access Control**: Make files public only when necessary.

4. **Image Optimization**: Use the appropriate image optimization for each use case:
   - `THUMBNAIL` for small previews
   - `MEDIUM` for standard content images
   - `LARGE` for hero/banner images
   - `WEBP` for better compression with good quality
   - `AVIF` for best compression (but less browser support)

5. **Caching**: The default cache control is set to 1 year for public files. Adjust as needed for your use case.

6. **Error Handling**: Always handle upload errors gracefully in the UI.

## Setting Up Your Own DigitalOcean Spaces

1. **Create a Space**:
   - Log in to your DigitalOcean account
   - Navigate to Spaces in the sidebar
   - Click "Create a Space"
   - Select region (Toronto is recommended for this app)
   - Name your space (e.g., "d4lcdn")
   - Choose "Restrict File Listing"
   - Click "Create a Space"

2. **Configure CDN**:
   - In your Space settings, click "Edge" tab
   - Enable CDN
   - Set custom subdomain if needed

3. **Create Access Keys**:
   - Navigate to API > Tokens/Keys > Spaces access keys
   - Generate new key
   - Save the access key and secret key in your `.env` file

4. **CORS Configuration**:
   - In your Space settings, click "Settings" tab
   - Add CORS configuration:
   ```
   Origin: https://your-app-domain.com (or * for development)
   Allowed Methods: GET, PUT, POST, DELETE
   Allowed Headers: *
   ```

## Example Demo

Visit `/examples/spaces` in the application to see a working demo of file uploads and image optimization with DigitalOcean Spaces.
