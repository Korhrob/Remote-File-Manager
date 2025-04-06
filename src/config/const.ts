import path from 'path';

export const patchesPath = path.join(process.env.NEXT_PUBLIC_ROOT || '', 'patch');
export const manifestPath = path.join(patchesPath, process.env.NEXT_PUBLIC_MANIFEST || 'manifest.txt');
export const maxFileSize = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || '50', 10) * 1024 * 1024; // Example: 50 MB in bytes