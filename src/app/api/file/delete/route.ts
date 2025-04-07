import fs from 'fs';
import path from 'path';
import { patchesPath } from '@/config/const';
import type { NextApiRequest, NextApiResponse } from "next"
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers'

export async function DELETE(req: NextApiRequest) {
    
    try {
        const headersList = await headers()
        const apiKey = headersList.get('x-api-key');
        
        if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
            return NextResponse.json({ error: "Unauthorized - invalid API key" }, { status: 401 });
        }

        const { filename } = req.body;

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400, });
        }

        const filePath = path.join(patchesPath, filename);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404, });
        }

        fs.unlinkSync(filePath);
        return NextResponse.json({ message: 'File deleted successfully' }, { status: 200, });

    } catch (err) {
        return NextResponse.json({ error: 'Failed to delete the file' }, { status: 500, });

    }
}
