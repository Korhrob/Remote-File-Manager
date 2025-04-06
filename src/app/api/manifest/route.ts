// src/app/api/manifest/route.ts

import { NextResponse } from 'next/server';
import { manifestPath } from '@/config/const';
import fs from 'fs';

export async function GET() {

  try {

	if (!fs.existsSync(manifestPath)) {
		return NextResponse.json(
		  { error: `Manifest file does not exist at ${manifestPath}` },
		  { status: 404 }
		);
	  }

    const data = await fs.promises.readFile(manifestPath, 'utf8');
    
    if (!data.trim()) {
		return NextResponse.json(
		  { error: 'Manifest file is empty' },
		  { status: 400 }
		);
	  }

    return NextResponse.json({ content: data });
  } catch (error) {
    console.error('Error reading manifest file:', error);
    return NextResponse.json({ error: `Failed to read manifest file ${manifestPath}` }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
  