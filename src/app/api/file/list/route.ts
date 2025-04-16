import { NextRequest, NextResponse } from "next/server";
import { manifestPath, patchesPath, rootPath } from '@/config/const';
import type { FileItem } from '@/types/filetype';
import fs from "fs/promises";

export async function GET(req: NextRequest) {
    try {

        const files = await fs.readdir(patchesPath);

        let manifestEntries: string[] = [];
        try {
            const manifestContent = await fs.readFile(manifestPath, "utf-8");
            manifestEntries = manifestContent.split("\n")
                .map(line => line.trim().split(" ")[1])
                .filter(Boolean);
        } catch (error) {
            console.log("Manifest file missing or unreadable, assuming empty.");
        }

        const fileItems: FileItem[] = files
            .filter(file => file !== "manifest.txt")
            .map(file => ({
                name: file,
                tracked: manifestEntries.includes(file),
        }));

        return NextResponse.json( fileItems , { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Failed to list patch files" }, { status: 500 });
        
    }
}