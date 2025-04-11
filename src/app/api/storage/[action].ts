import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

// Configure S3 client for Digital Ocean Spaces
const spacesEndpoint = process.env.DO_SPACES_ENDPOINT || 'tor1.digitaloceanspaces.com';
const spacesBucket = process.env.DO_SPACES_BUCKET || 'd4lcdn';
const spacesAccessKey = process.env.DO_SPACES_ACCESS_KEY;
const spacesSecretKey = process.env.DO_SPACES_SECRET_KEY;

// Initialize the S3 client
const s3 = new AWS.S3({
  endpoint: `https://${spacesEndpoint}`,
  accessKeyId: spacesAccessKey,
  secretAccessKey: spacesSecretKey,
  region: 'us-east-1',
  s3ForcePathStyle: false,
});

export async function POST(request: NextRequest) {
  const { action, key, data } = await request.json();

  try {
    if (!action || !key) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'upload':
        if (!data) {
          return NextResponse.json(
            { error: 'Missing data for upload' },
            { status: 400 }
          );
        }

        const uploadParams = {
          Bucket: spacesBucket,
          Key: key,
          Body: Buffer.from(data),
          ACL: 'public-read'
        };
        await s3.upload(uploadParams).promise();
        return NextResponse.json({ success: true });

      case 'delete':
        const deleteParams = {
          Bucket: spacesBucket,
          Key: key
        };
        await s3.deleteObject(deleteParams).promise();
        return NextResponse.json({ success: true });

      case 'exists':
        const headParams = {
          Bucket: spacesBucket,
          Key: key
        };
        try {
          await s3.headObject(headParams).promise();
          return NextResponse.json({ exists: true });
        } catch (error) {
          if (error instanceof Error && error.name === 'NotFound') {
            return NextResponse.json({ exists: false });
          }
          throw error;
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Storage error:', error.message);
    } else {
      console.error('Storage error:', error);
    }
    return NextResponse.json(
      { error: 'Storage operation failed' },
      { status: 500 }
    );
  }
}
