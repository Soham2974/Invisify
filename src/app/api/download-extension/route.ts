import { NextResponse } from 'next/server';
import archiver from 'archiver';

export async function GET() {
    try {
        // Create a ZIP archive
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Files to include in the extension
        const extensionFiles = [
            { path: 'extension/manifest.json', name: 'manifest.json' },
            { path: 'extension/content.js', name: 'content.js' },
            { path: 'extension/content.css', name: 'content.css' },
            { path: 'extension/popup.html', name: 'popup.html' },
            { path: 'extension/popup.js', name: 'popup.js' },
            { path: 'extension/background.js', name: 'background.js' },
        ];

        // Add files to the archive
        const fs = require('fs');
        const path = require('path');
        const primaryBaseDir = path.join(process.cwd(), 'public', 'extension');
        const fallbackBaseDir = path.join(process.cwd(), 'extension');
        const extensionBaseDir = fs.existsSync(primaryBaseDir) ? primaryBaseDir : fallbackBaseDir;

        extensionFiles.forEach(file => {
            const filePath = path.join(
                extensionBaseDir,
                path.basename(file.path)
            );
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: file.name });
            }
        });

        // Add icons directory
        const iconsPath = path.join(extensionBaseDir, 'icons');
        if (fs.existsSync(iconsPath)) {
            archive.directory(iconsPath, 'icons');
        }

        // Convert archive stream to a buffer before finalizing.
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
            archive.on('data', (chunk: Buffer) => chunks.push(chunk));
            archive.on('end', () => resolve());
            archive.on('error', (err: Error) => reject(err));
            archive.finalize().catch(reject);
        });

        const buffer = Buffer.concat(chunks);

        // Return the ZIP file
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="sentinel-prime-extension.zip"',
            },
        });
    } catch (error) {
        console.error('Extension download error:', error);
        return NextResponse.json(
            { error: 'Failed to generate extension package' },
            { status: 500 }
        );
    }
}
