import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { patchesPath } from '@/config/const';
import path from 'path';

export async function PATCH(req: NextRequest) {
    try {
        const { oldFilename, newFilename } = await req.json();

        if (!oldFilename || !newFilename) {
            return NextResponse.json({ error: "Invalid filenames provided." }, { status: 400 });
        }

        const oldFilePath = path.join(patchesPath, oldFilename);
        const newFilePath = path.join(patchesPath, newFilename);

        // Check if the old file exists before renaming
        try {
            await fs.access(oldFilePath);
        } catch (error) {
            return NextResponse.json({ error: "File not found." }, { status: 404 });
        }

        // Rename the file
        await fs.rename(oldFilePath, newFilePath);
        console.log(`Renamed: ${oldFilename} → ${newFilename}`);

        return NextResponse.json({ message: "File renamed successfully." }, { status: 200 });
    } catch (error) {
        console.error("Rename error:", error);
        return NextResponse.json({ error: "Error renaming file." }, { status: 500 });
    }
}
