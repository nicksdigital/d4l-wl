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
  const { prefix, maxKeys } = await request.json();

  try {
    const response = await s3.listObjects({
      Bucket: spacesBucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
    }).promise();

    return NextResponse.json({
      files: response.Contents || []
    });
  } catch (error) {
    console.error('Storage error:', error);
    return NextResponse.json(
      { error: 'Storage operation failed' },
      { status: 500 }
    );
  }
}
