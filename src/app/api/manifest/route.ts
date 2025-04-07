// src/app/api/manifest/route.ts

import { NextResponse } from 'next/server';
import { manifestPath } from '@/config/const';
import { validateApiKey } from '@/utils/validateApi'
import fs from 'fs';

export async function GET() {

	try {
        const validationResponse = await validateApiKey();
        if (validationResponse) {
          return validationResponse;
        }
		
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
        const validationResponse = await validateApiKey();
        if (validationResponse) {
          return validationResponse;
        }
		
		const { content } = await request.json();

		if (!content) {
		return NextResponse.json({ error: 'Content is required' }, { status: 400 });
		}

		await fs.promises.writeFile(manifestPath, content, 'utf8');
		
		return NextResponse.json({ message: 'Manifest updated successfully' });

	} catch (error) {

		console.error('Error updating manifest file:', error);
		return NextResponse.json({ error: 'Failed to update manifest file' }, { status: 500 });

	}
  }
  