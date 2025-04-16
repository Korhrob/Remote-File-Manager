import { exportTraceState } from 'next/dist/trace';
import path from 'path';

export const rootPath = process.env.NEXT_PUBLIC_ROOT || './temp';
export const patchesPath = path.join(rootPath, 'patch');
export const manifestPath = path.join(patchesPath, process.env.NEXT_PUBLIC_MANIFEST || 'manifest.txt');
export const serverPath = path.join(process.env.NEXT_PUBLIC_SERVER_PATH || '');
export const maxFileSize = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || '50', 10) * 1024 * 1024; // Example: 50 MB in bytes