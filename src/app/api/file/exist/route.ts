import { NextRequest, NextResponse } from 'next/server';
import { patchesPath, maxFileSize } from '@/config/const';
import type { NextApiRequest, NextApiResponse } from "next"
import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers'

export async function POST(req: NextApiRequest) {
	
	try {
		const headersList = await headers()
		const apiKey = headersList.get('x-api-key');
		
		if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
			return NextResponse.json({ error: "Unauthorized - invalid API key" }, { status: 401 });
		}

		const filename = req.body;
	
		if (!filename) {
			return NextResponse.json({ error: "Filename is required" }, { status: 400 });
		}

		const filePath = path.join(patchesPath, filename);
		await fs.promises.access(filePath, fs.constants.F_OK);
		return NextResponse.json({ exists: true });

	} catch (err) {

		return NextResponse.json({ exists: false });

	}
}