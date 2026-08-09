async function loadBitmap(file) {
    if (typeof createImageBitmap === 'function') {
        try {
            return await createImageBitmap(file, { imageOrientation: 'from-image' });
        } catch (e) {
            try {
                return await createImageBitmap(file);
            } catch (e2) {}
        }
    }
    const url = URL.createObjectURL(file);
    try {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
        await img.decode();
        return img;
    } finally {
        URL.revokeObjectURL(url);
    }
}

// Resizes/re-encodes an image in the browser so uploads stay well under
// hosting body-size limits (e.g. Vercel's 4.5 MB serverless cap).
// Returns a JPEG File with the same base name, or the original file if it
// cannot be decoded (e.g. HEIC on unsupported browsers).
export async function compressImage(file, { maxSize = 1600, quality = 0.8 } = {}) {
    if (typeof window === 'undefined' || !file || !file.type || !file.type.startsWith('image/')) {
        return file;
    }

    const source = await loadBitmap(file);
    if (!source) return file;

    const width = source.width || source.naturalWidth || 0;
    const height = source.height || source.naturalHeight || 0;
    if (!width || !height) return file;

    const scale = Math.min(1, maxSize / Math.max(width, height));
    const cw = Math.max(1, Math.round(width * scale));
    const ch = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0, cw, ch);
    if (typeof source.close === 'function') source.close();

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;

    const base = (file.name || 'image').replace(/\.[^.]+$/, '');
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
}
