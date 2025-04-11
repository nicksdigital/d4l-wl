import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { ContentTags, deleteCachedDataByContentTag } from '@/lib/cache';

/**
 * Admin API route for cache management
 * This endpoint handles cache invalidation for admin routes and provides
 * functionality to clear specific content tags or all admin-related cache
 */
export async function GET(request: NextRequest) {
  // Check for admin cache revalidation header from middleware
  const shouldRevalidate = request.headers.get('x-revalidate-admin-cache') === 'true';
  
  // Always revalidate admin cache on admin API requests
  if (shouldRevalidate) {
    await deleteCachedDataByContentTag(ContentTags.ADMIN);
    revalidateTag(ContentTags.ADMIN);
  }
  
  return NextResponse.json({ success: true, message: 'Admin cache status' });
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (should be handled by middleware, but double-check)
    // In a real app, you would use a more robust auth check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { action, tags } = body;
    
    // Handle different cache actions
    switch (action) {
      case 'clear_all':
        // Clear all admin-related cache
        await deleteCachedDataByContentTag(ContentTags.ADMIN);
        revalidateTag(ContentTags.ADMIN);
        
        // Also clear dynamic content since admin changes often affect dynamic content
        await deleteCachedDataByContentTag(ContentTags.DYNAMIC);
        revalidateTag(ContentTags.DYNAMIC);
        
        return NextResponse.json({
          success: true,
          message: 'All admin cache cleared successfully'
        });
        
      case 'clear_tags':
        // Clear specific content tags
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
          return NextResponse.json(
            { success: false, message: 'No tags provided' },
            { status: 400 }
          );
        }
        
        // Process each tag
        const results = await Promise.all(
          tags.map(async (tag) => {
            try {
              await deleteCachedDataByContentTag(tag);
              revalidateTag(tag);
              return { tag, success: true };
            } catch (error) {
              return { tag, success: false, error: (error as Error).message };
            }
          })
        );
        
        return NextResponse.json({
          success: true,
          message: 'Tags cleared successfully',
          results
        });
        
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in admin cache API:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
