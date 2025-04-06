import fs from 'fs';
import path from 'path';
import { patchesPath } from '@/config/const';

export async function DELETE(req: Request) {
    const url = new URL(req.url);
    const filename = url.searchParams.get('filename');

    if (!filename) {
        return new Response(JSON.stringify({ error: 'Filename is required' }), {
            status: 400,
        });
    }

    const filePath = path.join(patchesPath, filename);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        return new Response(JSON.stringify({ error: 'File not found' }), {
            status: 404,
        });
    }

    // Delete the file
    try {
        fs.unlinkSync(filePath); // Sync for simplicity
        return new Response(JSON.stringify({ message: 'File deleted successfully' }), {
            status: 200,
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to delete the file' }), {
            status: 500,
        });
    }
}
