import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

const ZIP_PATH = join(process.cwd(), 'public', 'downloads', 'sentinel-prime-extension.zip');

export async function GET() {
  try {
    const buffer = await fs.readFile(ZIP_PATH);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="sentinel-prime-extension.zip"',
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=3600, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('Extension download error:', error?.message || error);

    if (error?.code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Extension package not found. Please ensure the build completed successfully.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to serve extension package' },
      { status: 500 }
    );
  }
}
