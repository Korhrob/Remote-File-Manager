import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function PATCH(req: NextRequest) {
	try {
		const headersList = await headers();
		const target = headersList.get('x-target') || '';
		const { oldFilename, newFilename } = await req.json();

		if (!oldFilename || !newFilename) {
			return NextResponse.json(
				{ message: 'Invalid filenames provided.' },
				{ status: 400 },
			);
		}

		const oldFilePath = path.join(target, oldFilename);
		const newFilePath = path.join(target, newFilename);

		try {
			await fs.promises.access(oldFilePath);
		} catch (error) {
			return NextResponse.json(
				{ message: 'File not found.' },
				{ status: 404 },
			);
		}

		try {
			await fs.promises.access(newFilePath, fs.constants.F_OK);
			return NextResponse.json(
				{ message: 'File with this name already exists.' },
				{ status: 400 },
			);
		} catch (err: any) {
			//
		}

		await fs.promises.rename(oldFilePath, newFilePath);
		console.log(`Renamed: ${oldFilename} → ${newFilename}`);

		return NextResponse.json(
			{ message: 'File renamed successfully.' },
			{ status: 200 },
		);
	} catch (error) {
		console.error('Rename error:', error);
		return NextResponse.json(
			{ message: 'Error renaming file.' },
			{ status: 500 },
		);
	}
}
