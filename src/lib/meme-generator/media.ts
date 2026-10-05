export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_GIF_BYTES = 20 * 1024 * 1024;
export async function loadImage(src: string): Promise<HTMLImageElement> {
	const image = new Image();
	image.src = src;
	await image.decode();
	if (image.naturalWidth * image.naturalHeight > 40_000_000) throw new Error('Image too large');
	return image;
}
export async function loadImageFile(file: File): Promise<HTMLImageElement> {
	if (file.size > MAX_IMAGE_BYTES) throw new Error('Image too large');
	const url = URL.createObjectURL(file);
	try {
		return await loadImage(url);
	} finally {
		URL.revokeObjectURL(url);
	}
}
