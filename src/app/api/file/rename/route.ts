import { NextRequest, NextResponse } from 'next/server';
import { patchesPath } from '@/config/const';
import fs from 'fs/promises';
import path from 'path';

export async function PATCH(req: NextRequest, res: NextResponse) {
    try {
        const { oldFilename, newFilename } = await req.json();

        if (!oldFilename || !newFilename) {
            console.log(`${oldFilename} : ${newFilename}`);
            return NextResponse.json({ message: "Invalid filenames provided." }, { status: 400 });
        }

        const oldFilePath = path.join(patchesPath, oldFilename);
        const newFilePath = path.join(patchesPath, newFilename);

        try {
            await fs.access(oldFilePath);
        } catch (error) {
            return NextResponse.json({ message: "File not found." }, { status: 404 });
        }

        await fs.rename(oldFilePath, newFilePath);
        console.log(`Renamed: ${oldFilename} → ${newFilename}`);

        return NextResponse.json({ message: "File renamed successfully." }, { status: 200 });

    } catch (error) {
        console.error("Rename error:", error);
        return NextResponse.json({ message: "Error renaming file." }, { status: 500 });

    }
}
