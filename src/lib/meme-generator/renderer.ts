import type { CaptionSettings, ImageDocument, TextLayer } from './model';
export type DrawingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type DrawingCanvas = HTMLCanvasElement | OffscreenCanvas;

export function wrapText(
	context: Pick<DrawingContext, 'measureText'>,
	text: string,
	width: number
): string[] {
	const lines: string[] = [];
	for (const paragraph of text.split('\n')) {
		let line = '';
		for (const character of paragraph) {
			if (line && context.measureText(line + character).width > width) {
				const space = line.lastIndexOf(' ');
				if (space > 0) {
					lines.push(line.slice(0, space));
					line = line.slice(space + 1);
				} else {
					lines.push(line);
					line = '';
				}
			}
			line += character;
		}
		lines.push(line);
	}
	return lines;
}

export function textBounds(ctx: DrawingContext, layer: TextLayer, doc: ImageDocument) {
	ctx.font = `700 ${layer.fontSize}px ${layer.fontFamily}`;
	const lines = wrapText(
		ctx,
		layer.uppercase ? layer.text.toUpperCase() : layer.text,
		doc.width * 0.9
	);
	const width = Math.max(12, ...lines.map((line) => ctx.measureText(line).width));
	const height = lines.length * layer.fontSize * 1.2;
	return {
		lines,
		width,
		height,
		left: layer.x * doc.width - width / 2,
		top: layer.y * doc.height - height / 2
	};
}

export function renderImage(
	canvas: DrawingCanvas,
	doc: ImageDocument,
	image: CanvasImageSource,
	selectedId?: string
): void {
	const ctx = canvas.getContext('2d') as DrawingContext | null;
	if (!ctx) throw new Error('Canvas unavailable');
	ctx.save();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.scale(canvas.width / doc.width, canvas.height / doc.height);
	ctx.drawImage(image, 0, 0, doc.width, doc.height);
	for (const layer of doc.layers) {
		ctx.save();
		const bounds = textBounds(ctx, layer, doc);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.lineJoin = 'round';
		ctx.strokeStyle = layer.outlineColor;
		ctx.lineWidth = layer.outline * 2;
		ctx.fillStyle = layer.color;
		ctx.shadowColor = layer.glowColor;
		ctx.shadowBlur = layer.glow;
		bounds.lines.forEach((line, index) => {
			const y = bounds.top + layer.fontSize * 0.6 + index * layer.fontSize * 1.2;
			if (layer.outline) ctx.strokeText(line, layer.x * doc.width, y);
			if (layer.glow) {
				ctx.fillText(line, layer.x * doc.width, y);
				ctx.fillText(line, layer.x * doc.width, y);
			}
			ctx.fillText(line, layer.x * doc.width, y);
		});
		if (layer.id === selectedId) {
			ctx.shadowBlur = 0;
			ctx.strokeStyle = '#ef233c';
			ctx.lineWidth = 2;
			ctx.setLineDash([6, 4]);
			ctx.strokeRect(bounds.left - 6, bounds.top - 6, bounds.width + 12, bounds.height + 12);
		}
		ctx.restore();
	}
	ctx.restore();
}

export function captionLayout(ctx: DrawingContext, caption: CaptionSettings, width: number) {
	ctx.font = `700 ${caption.fontSize}px ${caption.fontFamily}`;
	const lines = caption.text.trim()
		? wrapText(
				ctx,
				caption.uppercase ? caption.text.toUpperCase() : caption.text,
				width - caption.padding * 2
			)
		: [];
	return {
		lines,
		height: lines.length
			? Math.ceil(lines.length * caption.fontSize * 1.15 + caption.padding * 2)
			: 0
	};
}
export function drawCaption(ctx: DrawingContext, caption: CaptionSettings, width: number) {
	const layout = captionLayout(ctx, caption, width);
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, width, layout.height);
	ctx.fillStyle = '#000000';
	ctx.textBaseline = 'top';
	ctx.textAlign = caption.align;
	const x = caption.align === 'left' ? caption.padding : width / 2;
	layout.lines.forEach((line, index) =>
		ctx.fillText(line, x, caption.padding + index * caption.fontSize * 1.15)
	);
	return layout;
}
