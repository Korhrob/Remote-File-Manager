// app/api/upload/route.js

import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { patchesPath } from '@/config/const';

export async function POST(request: NextRequest) {

    const formData = await request.formData();
    const file = formData.get('patch') as File | null;

    if (!file) {
        return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const filePath = path.join(patchesPath, file.name);
    console.log(filePath);

    try {
        await fs.promises.access(filePath, fs.constants.F_OK); // Check if file exists
        return NextResponse.json({ message: "File with this name already exists." }, { status: 400 });
    } catch (err: any) {

    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.promises.writeFile(filePath, buffer);

        return NextResponse.json({ message: "File uploaded successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ message: "Error uploading file" }, { status: 500 });

    }
}
