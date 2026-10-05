export type Locale = 'ru' | 'en';
export type TextLayer = {
	id: string;
	text: string;
	uppercase: boolean;
	x: number;
	y: number;
	fontSize: number;
	fontFamily: string;
	color: string;
	outline: number;
	outlineColor: string;
	glow: number;
	glowColor: string;
};
export type ImageDocument = { width: number; height: number; layers: TextLayer[] };
export type CaptionSettings = {
	text: string;
	uppercase: boolean;
	fontSize: number;
	fontFamily: string;
	align: 'left' | 'center';
	padding: number;
};
export type MediaTemplate = {
	id: string;
	name: Record<Locale, string>;
	src: string;
	width: number;
	height: number;
	text: string;
};

export const imageTemplates: MediaTemplate[] = [
	{
		id: 'no-pics',
		name: { ru: 'No pics?', en: 'No pics?' },
		src: '/memes/no-pics.png',
		width: 586,
		height: 569,
		text: 'No pics?'
	},
	{
		id: 'potential',
		name: { ru: 'Potential', en: 'Potential' },
		src: '/memes/potential.png',
		width: 1024,
		height: 741,
		text: 'did you say potential?'
	}
];
export const gifTemplates: MediaTemplate[] = [
	{
		id: 'video',
		name: { ru: 'Из видео', en: 'From video' },
		src: '/memes/video-template.gif',
		width: 400,
		height: 400,
		text: ''
	},
	{
		id: 'emoji',
		name: { ru: 'Эмодзи', en: 'Emoji' },
		src: '/memes/emoji-shoot.gif',
		width: 498,
		height: 297,
		text: ''
	}
];
export const fonts = [
	{ label: 'Impact', family: 'Impact, Arial Black, sans-serif' },
	{ label: 'Sans', family: 'Arial, sans-serif' },
	{ label: 'Serif', family: 'Georgia, serif' },
	{ label: 'Mono', family: 'monospace' }
];

export function createTextLayer(id: string, width: number, text = 'Text'): TextLayer {
	return {
		id,
		text,
		uppercase: false,
		x: 0.5,
		y: 0.5,
		fontSize: Math.round(width * 0.085),
		fontFamily: fonts[0].family,
		color: '#ffffff',
		outline: 3,
		outlineColor: '#000000',
		glow: 0,
		glowColor: '#9270ff'
	};
}
export function createImageDocument(template: MediaTemplate): ImageDocument {
	const layer = createTextLayer('initial', template.width, template.text);
	if (template.id === 'no-pics') {
		layer.y = 0.13;
		layer.fontSize = 86;
	}
	if (template.id === 'potential') {
		const title = createTextLayer('initial', template.width, 'did you say');
		const emphasis = createTextLayer('emphasis', template.width, 'potential');
		for (const text of [title, emphasis]) {
			text.uppercase = true;
			text.fontFamily = fonts[1].family;
			text.color = '#72b4ff';
			text.outlineColor = '#164bff';
			text.glowColor = '#003cff';
			text.glow = 24;
		}
		title.x = 0.27;
		title.y = 0.667;
		title.fontSize = 70;
		title.outline = 2;
		emphasis.x = 0.435;
		emphasis.y = 0.834;
		emphasis.fontSize = 140;
		emphasis.outline = 4;
		return { width: template.width, height: template.height, layers: [title, emphasis] };
	}
	return { width: template.width, height: template.height, layers: [layer] };
}
export function createCaption(): CaptionSettings {
	return {
		text: 'SAMPLE TEXT',
		uppercase: false,
		fontSize: 26,
		fontFamily: fonts[1].family,
		align: 'center',
		padding: 10
	};
}
export function clampPosition(value: number): number {
	return Math.max(0, Math.min(1, value));
}
