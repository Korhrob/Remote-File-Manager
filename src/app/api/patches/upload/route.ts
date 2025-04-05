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
      bodyParser: false,
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

    // const { showMessage } = useMessage(); // Access the context here

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
        const fileStream = fs.createWriteStream(filePath);
        const reader = file.stream().getReader();

        return await new Promise<Response>((resolve, reject) => {
            fileStream.on("error", (err) => {
                console.error("Stream error:", err);
                reject(
                    NextResponse.json({ error: "Failed to write file" }, { status: 500 })
                );
            });

            fileStream.on("finish", () => {
                console.log("File stream finished");
                resolve(
                    NextResponse.json({ message: "File uploaded successfully" }, { status: 200 })
                );
            });

            async function pump() {
                try {
                    const { done, value } = await reader.read();
                    if (done) {
                        fileStream.end(); // triggers "finish"
                        return;
                    }
                    if (value) {
                        fileStream.write(Buffer.from(value));
                    }
                } catch (err) {
                    reject(
                        NextResponse.json({ error: "Error while reading file stream" }, { status: 500 })
                    );
                }
            }

            pump();
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
    }
}

  