import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { rootPath } from '@/config/const';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {

    const headersList = await headers();
    const formData = await request.formData();
    const fileData = formData.get('data') as File | null;
    const target = headersList.get('x-target') as string;

    if (!fileData) {
        return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const filePath = path.join(rootPath, target, fileData.name);
    console.log(filePath);

    try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        return NextResponse.json({ message: "File with this name already exists." }, { status: 400 });

    } catch (error) {

    }

    try {
        const buffer = Buffer.from(await fileData.arrayBuffer());
        await fs.promises.writeFile(filePath, buffer);

        return NextResponse.json({ message: "File uploaded successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ message: "Error uploading file" }, { status: 500 });

    }
}
