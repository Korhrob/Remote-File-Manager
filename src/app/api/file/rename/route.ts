import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from "next"
import { patchesPath } from '@/config/const';
import fs from 'fs/promises';
import path from 'path';
import { headers } from 'next/headers'

export async function PATCH(req: NextApiRequest) {
    try {
		const headersList = await headers()
		const apiKey = headersList.get('x-api-key');
		
		if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
			return NextResponse.json({ error: "Unauthorized - invalid API key" }, { status: 401 });
		}

        const { oldFilename, newFilename } = await req.body;

        if (!oldFilename || !newFilename) {
            return NextResponse.json({ error: "Invalid filenames provided." }, { status: 400 });
        }

        const oldFilePath = path.join(patchesPath, oldFilename);
        const newFilePath = path.join(patchesPath, newFilename);

        try {
            await fs.access(oldFilePath);
        } catch (error) {
            return NextResponse.json({ error: "File not found." }, { status: 404 });
        }

        await fs.rename(oldFilePath, newFilePath);
        console.log(`Renamed: ${oldFilename} → ${newFilename}`);

        return NextResponse.json({ message: "File renamed successfully." }, { status: 200 });

    } catch (error) {
        console.error("Rename error:", error);
        return NextResponse.json({ error: "Error renaming file." }, { status: 500 });

    }
}
