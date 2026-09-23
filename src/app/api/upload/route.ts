import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Storage adapter interface (can easily swap to S3 or Cloudinary)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Safe clean filename
      const ext = path.extname(file.name) || '.jpg';
      const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
      const filePath = path.join(uploadDir, cleanName);

      fs.writeFileSync(filePath, buffer);
      uploadedUrls.push(`/uploads/${cleanName}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: `${uploadedUrls.length} file(s) uploaded successfully`,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files', details: error.message },
      { status: 500 }
    );
  }
}
