// src/app/api/patches/track/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const manifestPath = path.join('/var/www/html', 'manifest.txt');
  
  try {
    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Read the current manifest
    const manifestData = await fs.promises.readFile(manifestPath, 'utf8');
    const lines = manifestData.split('\n');

    // Find the last line in the manifest to get the last index
    const lastLine = lines[lines.length - 1].trim();
    const lastIndex = lastLine ? parseInt(lastLine.split(' ')[0], 10) : 0;
    const newIndex = isNaN(lastIndex) ? 1 : lastIndex + 1;

    // Append the new file entry to the manifest
    const newEntry = `${newIndex} ${filename}`;
    lines.push(newEntry);
    const updatedManifest = lines.join('\n');

    // Write the updated content back to the manifest file
    await fs.promises.writeFile(manifestPath, updatedManifest, 'utf8');

    // Return success response
    return NextResponse.json({ message: 'File tracked successfully' });
  } catch (error) {
    console.error('Error tracking file:', error);
    return NextResponse.json({ error: 'Failed to track file' }, { status: 500 });
  }
}
