import { NextRequest, NextResponse } from 'next/server';
import { patchesPath } from '@/config/const';
// import { useMessage } from '@/context/MessageContext'; 
//import fs from 'fs/promises';
import fs, { exists, writeFile } from 'fs';
import path from 'path';

const MAX_FOLDER_SIZE = 1024 * 1024 * 1024; // 1GB folder limit
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB per file limit

// Function to calculate total folder size
// async function getFolderSize(folderPath: string): Promise<number> {
//     const files = await fs.readdir(folderPath);
//     let totalSize = 0;

//     for (const file of files) {
//         const filePath = path.join(folderPath, file);
//         const stats = await fs.stat(filePath);
//         if (stats.isFile()) {
//             totalSize += stats.size;
//         }
//     }
//     return totalSize;
// }

export const config = {
    api: {
      bodyParser: {
        sizeLimit: '100mb', // Set the body size limit to 100MB for this route
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
        await fs.promises.access(filePath, fs.constants.F_OK); // Check if file exists

        // If the file exists, return a response saying so
        return NextResponse.json({ exists: true });
    } catch (err) {
        return NextResponse.json({ exists: false });
    }
}

export async function POST(req: NextRequest) {

    try {

        // Debug: Log the request method
        console.log("Received upload request");

        // Parse the request FormData
        const formData = await req.formData();
        console.log("FormData received:", formData);

        const file = formData.get("patch") as File | null;
        console.log("Extracted file:", file);

        if (!file) {
            console.error("No file received!");
            return NextResponse.json({ error: "No file uploaded or invalid file" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            console.error("File is too large!");
            return NextResponse.json({ error: `File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` }, { status: 400 });
        }

        // const currentFolderSize = await getFolderSize(patchesPath);
        // if (currentFolderSize + file.size > MAX_FOLDER_SIZE) {
        //     return NextResponse.json({ error: "Patch folder is too full. Cannot upload more files." }, { status: 400 });
        // }

        const filePath = path.join(patchesPath, file.name);

        try {
            await fs.promises.access(filePath, fs.constants.F_OK); // Check if file exists
            return NextResponse.json({ error: "File with this name already exists." }, { status: 400 });
        } catch (err: any) {

        }

        try {
            // Save the file to the server
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

  