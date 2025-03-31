// src/app/api/manifest/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const manifestPath = path.join('/var/www/html', 'manifest.txt');

  try {
    // Read the manifest file
    const data = await fs.promises.readFile(manifestPath, 'utf8');
    
    // Return the manifest content
    return NextResponse.json({ content: data });
  } catch (error) {
    console.error('Error reading manifest file:', error);
    return NextResponse.json({ error: 'Failed to read manifest file' }, { status: 500 });
  }
}

// src/app/api/manifest/route.ts

export async function PATCH(request: Request) {
	const manifestPath = path.join('/var/www/html', 'manifest.txt');
  
	try {
	  // Get the updated content from the request body
	  const { content } = await request.json();
	  
	  // Validate the content (you can add more checks here)
	  if (!content) {
		return NextResponse.json({ error: 'Content is required' }, { status: 400 });
	  }
	  
	  // Write the new content to the manifest file
	  await fs.promises.writeFile(manifestPath, content, 'utf8');
	  
	  // Return success message
	  return NextResponse.json({ message: 'Manifest updated successfully' });
	} catch (error) {
	  console.error('Error updating manifest file:', error);
	  return NextResponse.json({ error: 'Failed to update manifest file' }, { status: 500 });
	}
  }
  