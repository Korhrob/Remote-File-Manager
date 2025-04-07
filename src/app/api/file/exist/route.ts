import { NextRequest, NextResponse } from 'next/server';
import { patchesPath, maxFileSize } from '@/config/const';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
	
	try {

		const { filename } = await req.json();
	
		if (!filename) {
			return NextResponse.json({ message: "Filename is required" }, { status: 400 });
		}

		const filePath = path.join(patchesPath, filename);
		await fs.promises.access(filePath, fs.constants.F_OK);
		return NextResponse.json({ exists: true });

	} catch (err) {

		return NextResponse.json({ exists: false });

	}
}