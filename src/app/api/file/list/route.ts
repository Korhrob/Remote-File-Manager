import { NextRequest, NextResponse } from "next/server";
import { manifestFile } from '@/config/const';
import type { FileItem } from '@/types/filetype';
import fs from "fs/promises";
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const headersList = await headers();
        const target = headersList.get("x-target") as string;
        const files = await fs.readdir(target);
        const manifestPath = `${target}${manifestFile}`;

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