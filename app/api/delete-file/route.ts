import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/uploadthing-server';

export async function DELETE(req: NextRequest) {
  try {
    const { fileKey } = await req.json();
    
    if (!fileKey) {
      return NextResponse.json({ error: 'File key is required' }, { status: 400 });
    }

    const success = await deleteFile(fileKey);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in delete file API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 