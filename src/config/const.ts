import { exportTraceState } from 'next/dist/trace';
import path from 'path';

export const rootPath = process.env.NEXT_PUBLIC_ROOT || './temp';
export const patchesPath = path.join(rootPath, 'patch');
export const manifestFile = process.env.NEXT_PUBLIC_MANIFEST || 'manifest.txt';
export const manifestPath = path.join(patchesPath, manifestFile);

export const serverPath = process.env.NEXT_PUBLIC_SERVER_PATH || './temp';
export const dbPath = path.join(
	serverPath,
	process.env.NEXT_PUBLIC_DB_PATH || 'db/import',
);

export const maxFileSize =
	parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || '50', 10) * 1024 * 1024; // Example: 50 MB in bytes
