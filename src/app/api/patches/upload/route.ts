import { NextRequest, NextResponse } from 'next/server';
import { patchesPath } from '@/config/const';
import { useMessage } from '@/context/MessageContext'; 
import fs from 'fs/promises';
import path from 'path';

const MAX_FOLDER_SIZE = 1024 * 1024 * 1024; // 1GB folder limit
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB per file limit

// Function to calculate total folder size
async function getFolderSize(folderPath: string): Promise<number> {
    const files = await fs.readdir(folderPath);
    let totalSize = 0;

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
            totalSize += stats.size;
        }
    }
    return totalSize;
}

export async function POST(req: NextRequest) {

    const { showMessage } = useMessage(); // Access the context here

    try {

        showMessage("Uploading...", 'success');
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
            return NextResponse.json({ error: "File size exceeds the 30MB limit" }, { status: 400 });
        }

        const currentFolderSize = await getFolderSize(patchesPath);
        if (currentFolderSize + file.size > MAX_FOLDER_SIZE) {
            return NextResponse.json({ error: "Patch folder is too full. Cannot upload more files." }, { status: 400 });
        }

        // Read file content
        const buffer = Buffer.from(await file.arrayBuffer());

        // Debug: Log file buffer size
        console.log("Buffer size:", buffer.length);

        // Define file path
        const filePath = path.join(patchesPath, file.name);
        console.log("Saving file to:", filePath);

        // Write file to server
        await fs.writeFile(filePath, buffer);

        return NextResponse.json({ message: "File uploaded successfully" }, { status: 200 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
    }
}

  