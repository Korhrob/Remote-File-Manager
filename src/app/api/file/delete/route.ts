import fs from 'fs';
import path from 'path';
import { patchesPath } from '@/config/const';
import type { NextApiRequest, NextApiResponse } from "next"
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/utils/validateApi'

export async function DELETE(req: NextApiRequest) {
    
    try {
        const validationResponse = await validateApiKey();
        if (validationResponse) {
          return validationResponse;
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
