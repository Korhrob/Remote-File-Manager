import { NextRequest, NextResponse } from 'next/server';
import { manifestFile } from '@/config/const';
import { headers } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
	try {
		const headersList = await headers();
		const target = headersList.get('x-target') as string;
		const { filename } = await req.json();

		if (!filename) {
			return NextResponse.json(
				{ message: 'Filename is required' },
				{ status: 400 },
			);
		}

		const manifestPath = path.join(target, manifestFile);
		console.log(`manifestPath: ${manifestPath}`);

		// check that manifest file exists

		const manifestData = await fs.promises.readFile(manifestPath, 'utf8');
		const lines = manifestData.split('\n');

		const lastLine = lines[lines.length - 1].trim();
		const lastIndex = lastLine ? parseInt(lastLine.split(' ')[0], 10) : 0;
		const newIndex = isNaN(lastIndex) ? 1 : lastIndex + 1;

		const newEntry = `${newIndex} ${filename}`;
		lines.push(newEntry);
		const updatedManifest = lines.join('\n');

		await fs.promises.writeFile(manifestPath, updatedManifest, 'utf8');

		return NextResponse.json(
			{ message: 'File tracked successfully' },
			{ status: 200 },
		);
	} catch (error) {
		console.error('Error tracking file:', error);
		return NextResponse.json(
			{ message: 'Failed to track file' },
			{ status: 500 },
		);
	}
}
