import path from 'path';

export const manifestPath = path.join(process.env.NEXT_PUBLIC_ROOT || '', process.env.NEXT_MANIFEST || 'manifest.txt');
export const patchesPath = path.join(process.env.NEXT_PUBLIC_ROOT || '', 'patch'); // Path to your patches directory