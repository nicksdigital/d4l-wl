import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag as nextRevalidateTag, revalidatePath as nextRevalidatePath } from 'next/cache';
import { deleteCachedDataByContentTag, deleteCachedDataFromRedis } from '@/lib/cache';

// API route for revalidating cache
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get('secret');
    
    // Optional: Check for a secret to secure the revalidation endpoint
    // In production, you'd want to use an environment variable for this
    const expectedSecret = process.env.REVALIDATION_SECRET || 'd4l-revalidation-secret';
    
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { message: 'Invalid revalidation secret' },
        { status: 401 }
      );
    }

    // Handle tag-based revalidation
    const tag = searchParams.get('tag');
    if (tag) {
      // Clear Redis cache for this tag
      await deleteCachedDataByContentTag(tag);
      
      // Also use Next.js built-in revalidation
      nextRevalidateTag(tag);
      
      return NextResponse.json({
        revalidated: true,
        message: `Tag ${tag} revalidated successfully in both Redis and Next.js cache`,
      });
    }

    // Handle path-based revalidation
    const path = searchParams.get('path');
    if (path) {
      // Clear Redis cache for this path
      await deleteCachedDataFromRedis('path', { path });
      
      // Also use Next.js built-in revalidation
      nextRevalidatePath(path);
      
      return NextResponse.json({
        revalidated: true,
        message: `Path ${path} revalidated successfully in both Redis and Next.js cache`,
      });
    }

    // If no tag or path is provided
    return NextResponse.json(
      { message: 'No tag or path provided for revalidation' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error during revalidation:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: (error as Error).message },
      { status: 500 }
    );
  }
}
