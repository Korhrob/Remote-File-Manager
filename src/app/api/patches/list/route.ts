import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const PATCH_STORAGE_PATH = process.env.PATCH_STORAGE_PATH || "/var/www/html/patches";
const MANIFEST_PATH = process.env.PATCH_MANIFEST_PATH || "/var/www/html/manifest.txt";

export async function GET() {
    try {
        // Read all files in the patches directory
        const files = await fs.readdir(PATCH_STORAGE_PATH);
        
        // Read manifest file (if it exists)
        let manifestEntries: string[] = [];
        try {
            const manifestContent = await fs.readFile(MANIFEST_PATH, "utf-8");
            manifestEntries = manifestContent.split("\n")
                .map(line => line.trim().split(" ")[1]) // Extract filename (skip index)
                .filter(Boolean); // Remove empty lines
        } catch (error) {
            console.log("Manifest file missing or unreadable, assuming empty.");
        }

        // Filter tracked and untracked files
        const tracked = files.filter(file => manifestEntries.includes(file));
        const untracked = files.filter(file => !manifestEntries.includes(file) && file !== "manifest.txt");

        return new Response(JSON.stringify({ tracked, untracked }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to list patch files" }), { status: 500 });
    }
}