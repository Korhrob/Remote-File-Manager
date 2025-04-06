import { NextRequest, NextResponse } from 'next/server';
import { patchesPath, maxFileSize } from '@/config/const';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
      bodyParser: {
        sizeLimit: `${maxFileSize}mb`,
      },
    },
  };

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const filename = searchParams.get("filename");

    if (!filename) {
        return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    try {
        const filePath = path.join(patchesPath, filename);
        await fs.promises.access(filePath, fs.constants.F_OK);
        return NextResponse.json({ exists: true });
    } catch (err) {
        return NextResponse.json({ exists: false });
    }
}

export async function POST(req: NextRequest) {

    try {
        console.log("Received upload request");

        const formData = await req.formData();
        console.log("FormData received:", formData);

        const file = formData.get("patch") as File | null;
        console.log("Extracted file:", file);

        if (!file) {
            console.error("No file received!");
            return NextResponse.json({ error: "No file uploaded or invalid file" }, { status: 400 });
        }

        if (file.size > maxFileSize) {
            return NextResponse.json({ error: `File size exceeds the ${maxFileSize}MB limit` }, { status: 400 });
        }

        const filePath = path.join(patchesPath, file.name);

        try {
            await fs.promises.access(filePath, fs.constants.F_OK); // Check if file exists
            return NextResponse.json({ error: "File with this name already exists." }, { status: 400 });
        } catch (err: any) {
            // No need to catch
        }

        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.promises.writeFile(filePath, buffer);

            return NextResponse.json({ message: "File uploaded successfully" }, { status: 200 });
        } catch (error) {
            console.error("Error uploading file:", error);
            return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
        }

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
    }
}

  