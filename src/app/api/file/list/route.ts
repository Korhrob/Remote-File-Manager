import { NextRequest, NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next"
import { manifestPath, patchesPath } from '@/config/const';
import { validateApiKey } from '@/utils/validateApi'
import fs from "fs/promises";

export async function GET(req: NextApiRequest) {
    try {
        const validationResponse = await validateApiKey();
        if (validationResponse) {
          return validationResponse;
        }

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

        const tracked = files.filter(file => manifestEntries.includes(file));
        const untracked = files.filter(file => !manifestEntries.includes(file) && file !== "manifest.txt");

        return NextResponse.json(({ tracked, untracked }), { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to list patch files" }, { status: 500 });
        
    }
}