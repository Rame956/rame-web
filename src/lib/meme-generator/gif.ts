import * as gifenc from 'gifenc';

const { GIFEncoder, quantize, applyPalette } =
	typeof gifenc.GIFEncoder === 'function'
		? gifenc
		: (gifenc as unknown as { default: typeof gifenc }).default;

export function createGifEncoder(width: number, height: number) {
	if (
		!Number.isInteger(width) ||
		!Number.isInteger(height) ||
		width < 1 ||
		height < 1 ||
		width > 65535 ||
		height > 65535
	)
		throw new Error('Invalid GIF dimensions');
	const encoder = GIFEncoder();
	let count = 0;
	return {
		addFrame(rgba: Uint8ClampedArray, delay: number) {
			if (rgba.length !== width * height * 4) throw new Error('Invalid GIF frame');
			const palette = quantize(rgba, 256);
			const indexed = applyPalette(rgba, palette);
			encoder.writeFrame(indexed, width, height, {
				palette,
				delay: Math.max(20, delay),
				repeat: 0,
				dispose: 1
			});
			count++;
		},
		finish(): Uint8Array<ArrayBuffer> {
			if (!count) throw new Error('No GIF frames');
			encoder.finish();
			return Uint8Array.from(encoder.bytes());
		}
	};
}
