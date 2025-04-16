import fs from 'fs';
import path from 'path';
import { rootPath } from '@/config/const';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
    
    try {

        const { target, filename } = await req.json();

        if (!filename) {
            return NextResponse.json({ message: 'Filename is required' }, { status: 400, });
        }

        const filePath = path.join(rootPath, target, filename);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ errmessageor: 'File not found' }, { status: 404, });
        }

        fs.unlinkSync(filePath);
        return NextResponse.json({ message: 'File deleted successfully' }, { status: 200, });

    } catch (err) {
        return NextResponse.json({ message: 'Failed to delete the file' }, { status: 500, });

    }
}
