import { IncomingForm, Fields, Files } from 'formidable';
import { NextRequest, NextResponse } from 'next/server';
import { patchesPath, maxFileSize } from '@/config/const';
import type { NextApiRequest, NextApiResponse } from "next"
import fs from 'fs';
import path from 'path';
import { validateApiKey } from '@/utils/validateApi'

export const config = {
    api: {
        bodyParser: {
            sizeLimit: `${maxFileSize}mb`,
        },
    },
};

export async function POST(req: NextApiRequest, res: NextApiResponse) {

    try {
        const validationResponse = await validateApiKey();
        if (validationResponse) {
          return validationResponse;
        }

        const form = new IncomingForm();

        // Handle the form parsing
        form.parse(req, async (err: any, fields: Fields, files: Files) => {
            if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).json({ error: 'Error parsing form data' });
            }

            // Get the file from the form
            const file = files.patch?.[0]; // Files should be an array in case multiple files are uploaded
            if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
            }

            // Validate file size
            if (file.size > maxFileSize) {
            return res.status(400).json({ error: `File size exceeds the ${maxFileSize}MB limit` });
            }

            // Check if the file already exists
            const filePath = path.join(patchesPath, file.originalFilename!);
            try {
            await fs.promises.access(filePath, fs.constants.F_OK); // Check if file exists
            return res.status(400).json({ error: 'File with this name already exists.' });
            } catch (err) {
            // File does not exist, continue
            }

            // Move the uploaded file to the desired location
            try {
            await fs.promises.rename(file.filepath, filePath); // Rename the temporary file to its final location
            return res.status(200).json({ message: 'File uploaded successfully', filePath });
            } catch (error) {
            console.error('Error moving file:', error);
            return res.status(500).json({ error: 'Error uploading file' });
            }
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Error uploading file" }, { status: 500 });

    }
}

  