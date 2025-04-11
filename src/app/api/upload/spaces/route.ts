import { NextRequest, NextResponse } from 'next/server';
import { uploadBuffer } from '@/lib/storage';
import { randomUUID } from 'crypto';

/**
 * Handles file uploads to DigitalOcean Spaces
 * @param request The incoming request with the file to upload
 */
export async function POST(request: NextRequest) {
  try {
    // For now, let's skip authentication - implement your actual auth logic later
    // const user = await authenticate(request);
    
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
    
    // Simulate a user for now
    const user = { id: 'demo-user-id' };
    
    // Get FormData from the request
    const formData = await request.formData();
    
    // Get the file from FormData
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Get content type and folder from FormData
    const contentType = file.type || undefined;
    const folder = formData.get('folder') as string || 'uploads';
    const isPublic = formData.get('isPublic') !== 'false';
    
    // Generate metadata
    const metadata = {
      userId: user.id,
      originalName: file.name,
      uploadId: randomUUID(),
    };
    
    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Upload the file to DigitalOcean Spaces
    const uploadResult = await uploadBuffer(fileBuffer, file.name, {
      contentType,
      folder,
      isPublic,
      metadata,
    });
    
    // Return the upload result
    return NextResponse.json(uploadResult);
  } catch (error) {
    console.error('Error uploading file:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handles OPTIONS requests for CORS pre-flight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
