import path from 'path';

export const patchesPath = path.join(process.env.NEXT_PUBLIC_ROOT || '', 'patch'); // Path to your patches directory
export const manifestPath = path.join(patchesPath, process.env.NEXT_MANIFEST || 'manifest.txt');