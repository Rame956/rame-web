import { parseGIF, decompressFrame } from 'gifuct-js';
import { createGifEncoder } from './gif';
import { captionLayout, drawCaption } from './renderer';
import type { CaptionSettings } from './model';

export type GifExportRequest = { buffer: ArrayBuffer; caption: CaptionSettings };
export type GifExportResponse =
	| { type: 'progress'; value: number }
	| { type: 'done'; buffer: ArrayBuffer }
	| { type: 'error'; message: string };

self.onmessage = (event: MessageEvent<GifExportRequest>) => {
	try {
		const { buffer, caption } = event.data;
		const parsed = parseGIF(buffer);
		const frames = parsed.frames.filter((frame) => 'image' in frame);
		const { width, height } = parsed.lsd;
		if (
			!frames.length ||
			frames.length > 400 ||
			width * height > 4_000_000 ||
			frames.length * width * height > 100_000_000
		)
			throw new Error('GIF exceeds export limits');
		const surface = new OffscreenCanvas(width, height);
		const ctx = surface.getContext('2d');
		if (!ctx) throw new Error('Canvas unavailable');
		const patch = new OffscreenCanvas(1, 1);
		const patchCtx = patch.getContext('2d');
		if (!patchCtx) throw new Error('Canvas unavailable');
		const captionHeight = captionLayout(ctx, caption, width).height;
		const scale = Math.min(1, 640 / width);
		const output = new OffscreenCanvas(
			Math.round(width * scale),
			Math.round((height + captionHeight) * scale)
		);
		const outputCtx = output.getContext('2d', { willReadFrequently: true });
		if (!outputCtx) throw new Error('Canvas unavailable');
		const encoder = createGifEncoder(output.width, output.height);
		const background = parsed.gct?.[parsed.lsd.backgroundColorIndex] ?? [0, 0, 0];
		if (!frames[0].gce?.extras.transparentColorGiven) {
			ctx.fillStyle = `rgb(${background.join(',')})`;
			ctx.fillRect(0, 0, width, height);
		}
		frames.forEach((source, index) => {
			const frame = decompressFrame(source, parsed.gct, true);
			const previous = frame.disposalType === 3 ? ctx.getImageData(0, 0, width, height) : undefined;
			patch.width = frame.dims.width;
			patch.height = frame.dims.height;
			patchCtx.putImageData(
				new ImageData(
					frame.patch as Uint8ClampedArray<ArrayBuffer>,
					frame.dims.width,
					frame.dims.height
				),
				0,
				0
			);
			ctx.drawImage(patch, frame.dims.left, frame.dims.top);
			outputCtx.setTransform(scale, 0, 0, scale, 0, 0);
			outputCtx.fillStyle = '#111111';
			outputCtx.fillRect(0, 0, width, height + captionHeight);
			drawCaption(outputCtx, caption, width);
			outputCtx.drawImage(surface, 0, captionHeight);
			encoder.addFrame(outputCtx.getImageData(0, 0, output.width, output.height).data, frame.delay);
			if (frame.disposalType === 2) {
				ctx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height);
				if (frame.transparentIndex === undefined) {
					ctx.fillStyle = `rgb(${background.join(',')})`;
					ctx.fillRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height);
				}
			} else if (previous) ctx.putImageData(previous, 0, 0);
			self.postMessage({
				type: 'progress',
				value: Math.round(((index + 1) / frames.length) * 100)
			} satisfies GifExportResponse);
		});
		const encoded = encoder.finish();
		self.postMessage({ type: 'done', buffer: encoded.buffer } satisfies GifExportResponse, {
			transfer: [encoded.buffer]
		});
	} catch (error) {
		self.postMessage({
			type: 'error',
			message: error instanceof Error ? error.message : 'GIF export failed'
		} satisfies GifExportResponse);
	}
};
