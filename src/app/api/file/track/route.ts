import { NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from "next"
import { manifestPath } from '@/config/const';
import fs from 'fs';
import { headers } from 'next/headers'

export async function POST(req: NextApiRequest) {

    try {
        const headersList = await headers()
        const apiKey = headersList.get('x-api-key');

        if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
            return NextResponse.json({ error: "Unauthorized - invalid API key" }, { status: 401 });
        }

        const { filename } = await req.body;

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
        }

        const manifestData = await fs.promises.readFile(manifestPath, 'utf8');
        const lines = manifestData.split('\n');

        const lastLine = lines[lines.length - 1].trim();
        const lastIndex = lastLine ? parseInt(lastLine.split(' ')[0], 10) : 0;
        const newIndex = isNaN(lastIndex) ? 1 : lastIndex + 1;

        const newEntry = `${newIndex} ${filename}`;
        lines.push(newEntry);
        const updatedManifest = lines.join('\n');

        await fs.promises.writeFile(manifestPath, updatedManifest, 'utf8');

        return NextResponse.json({ message: 'File tracked successfully' });

    } catch (error) {
        console.error('Error tracking file:', error);
        return NextResponse.json({ error: 'Failed to track file' }, { status: 500 });

    }
}
