import { NextRequest, NextResponse } from 'next/server';
import { patchesPath, maxFileSize } from '@/config/const';
import type { NextApiRequest, NextApiResponse } from "next"
import fs from 'fs';
import path from 'path';
import { validateApiKey } from '@/utils/validateApi'

export async function POST(req: NextApiRequest) {
	
	try {
		const validationResponse = await validateApiKey();
		if (validationResponse) {
		  return validationResponse;
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