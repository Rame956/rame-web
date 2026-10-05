<script lang="ts">
	const uid = $props.id();
	import { onMount } from 'svelte';
	import { createCaption, fonts, gifTemplates, type Locale } from './model';
	import { captionLayout, drawCaption } from './renderer';
	import { downloadBlob } from './export';
	import { MAX_GIF_BYTES } from './media';
	import type { GifExportResponse } from './gif-export.worker';
	let { locale }: { locale: Locale } = $props();
	const t = (ru: string, en: string) => (locale === 'ru' ? ru : en);
	let caption = $state(createCaption());
	let src = $state(gifTemplates[0].src);
	let templateId = $state(gifTemplates[0].id);
	let width = $state(gifTemplates[0].width);
	let height = $state(gifTemplates[0].height);
	let headerHeight = $state(0);
	let header: HTMLCanvasElement;
	let busy = $state(false);
	let progress = $state(0);
	let loading = $state(true);
	let message = $state('');
	let name = $state('');
	let mounted = $state(false);
	let uploadBuffer: ArrayBuffer | undefined;
	let objectUrl: string | undefined;
	let worker: Worker | undefined;
	let controller: AbortController | undefined;
	let alive = true;
	let uploadRequest = 0;

	onMount(() => {
		mounted = true;
		return () => {
			alive = false;
			uploadRequest++;
			controller?.abort();
			worker?.terminate();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	});
	$effect(() => {
		if (!mounted || !header) return;
		const settings = { ...caption };
		header.width = width;
		const ctx = header.getContext('2d');
		if (!ctx) return;
		headerHeight = captionLayout(ctx, settings, width).height;
		header.height = Math.max(1, headerHeight);
		drawCaption(ctx, settings, width);
	});
	function chooseTemplate(id: string) {
		const template = gifTemplates.find((entry) => entry.id === id);
		if (!template) return;
		uploadRequest++;
		if (objectUrl) URL.revokeObjectURL(objectUrl);
		objectUrl = undefined;
		uploadBuffer = undefined;
		src = template.src;
		templateId = id;
		width = template.width;
		height = template.height;
		name = '';
		message = '';
		loading = true;
	}
	async function upload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		const version = ++uploadRequest;
		try {
			if (file.size > MAX_GIF_BYTES) throw new Error('GIF too large');
			const buffer = await file.arrayBuffer();
			const bytes = new Uint8Array(buffer);
			const signature = new TextDecoder().decode(bytes.subarray(0, 6));
			if (!['GIF87a', 'GIF89a'].includes(signature)) throw new Error('Not a GIF');
			const nextWidth = bytes[6] | (bytes[7] << 8),
				nextHeight = bytes[8] | (bytes[9] << 8);
			if (!nextWidth || !nextHeight || nextWidth * nextHeight > 4_000_000)
				throw new Error('GIF too large');
			if (!alive || version !== uploadRequest) return;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
			objectUrl = URL.createObjectURL(file);
			uploadBuffer = buffer;
			src = objectUrl;
			width = nextWidth;
			height = nextHeight;
			templateId = '';
			name = file.name;
			loading = true;
			message = '';
		} catch {
			if (alive && version === uploadRequest)
				message = t(
					'Не удалось открыть GIF. Максимум 20 МБ и 4 мегапикселя.',
					'Could not open GIF. Maximum 20 MB and 4 megapixels.'
				);
		}
	}
	function cancel() {
		controller?.abort();
		worker?.terminate();
		worker = undefined;
		busy = false;
		progress = 0;
	}
	async function save() {
		busy = true;
		progress = 0;
		message = '';
		const settings = $state.snapshot(caption);
		controller = new AbortController();
		const abort = controller;
		try {
			let buffer: ArrayBuffer;
			if (uploadBuffer) buffer = uploadBuffer.slice(0);
			else {
				const response = await fetch(src, { signal: abort.signal });
				if (!response.ok) throw new Error('Could not load GIF');
				buffer = await response.arrayBuffer();
			}
			if (!alive || abort.signal.aborted) return;
			if (typeof OffscreenCanvas === 'undefined') throw new Error('OffscreenCanvas unavailable');
			worker = new Worker(new URL('./gif-export.worker.ts', import.meta.url), { type: 'module' });
			worker.onmessage = (event: MessageEvent<GifExportResponse>) => {
				if (!alive || abort.signal.aborted) return;
				const result = event.data;
				if (result.type === 'progress') progress = result.value;
				else {
					if (result.type === 'done') {
						downloadBlob(new Blob([result.buffer], { type: 'image/gif' }), 'caption-meme.gif');
						message = t('GIF готова.', 'GIF saved.');
					} else
						message = t(
							'Не удалось сохранить GIF. Попробуйте файл поменьше (до 400 кадров).',
							'Could not save GIF. Try a smaller file (up to 400 frames).'
						);
					worker?.terminate();
					worker = undefined;
					busy = false;
				}
			};
			worker.onerror = () => {
				if (alive && !abort.signal.aborted) {
					message = t('Браузер не смог обработать GIF.', 'The browser could not process the GIF.');
					cancel();
				}
			};
			worker.postMessage({ buffer, caption: settings }, [buffer]);
		} catch {
			if (alive && !abort.signal.aborted) {
				message = t(
					'Не удалось сохранить GIF в этом браузере.',
					'Could not save GIF in this browser.'
				);
				busy = false;
			}
		}
	}
</script>

<div class="editor-grid">
	<section class="preview-pane" aria-label={t('Предпросмотр GIF', 'GIF preview')}>
		<div class="template-list">
			{#each gifTemplates as template (template.id)}<button
					aria-label={template.name[locale]}
					aria-pressed={templateId === template.id}
					class:active={templateId === template.id}
					disabled={busy}
					onclick={() => chooseTemplate(template.id)}><img src={template.src} alt="" /></button
				>{/each}
		</div>
		<div class="preview-stage gif-stage">
			{#if loading}<p class="loading">{t('Загрузка…', 'Loading…')}</p>{/if}
			<div class="gif-composition" style:max-width={`${width}px`}>
				<canvas
					class="caption-preview"
					class:hidden={headerHeight === 0}
					bind:this={header}
					aria-label={caption.uppercase ? caption.text.toUpperCase() : caption.text}
				></canvas>
				<img
					class="gif-preview"
					{src}
					alt={t('Анимированный шаблон мема', 'Animated meme template')}
					{width}
					{height}
					onload={() => {
						loading = false;
					}}
					onerror={() => {
						loading = false;
						message = t('Не удалось загрузить GIF.', 'Could not load GIF.');
					}}
				/>
			</div>
		</div>
		<div class="export-actions">
			<button class="primary" onclick={save} disabled={busy || loading}
				>{busy
					? `${t('Сохранение', 'Exporting')} ${progress}%`
					: t('Сохранить GIF', 'Save GIF')}</button
			>{#if busy}<button onclick={cancel}>{t('Отменить', 'Cancel')}</button>{/if}
		</div>
		{#if busy}<progress
				max="100"
				value={progress}
				aria-label={t('Сохранение GIF', 'GIF export progress')}
			></progress>{/if}
		<p class="status" role="status">{message}</p>
	</section>
	<section class="controls" aria-label={t('Редактор GIF', 'GIF editor')}>
		<fieldset disabled={busy}>
			<h2>{t('Подпись над гифкой', 'Caption above the GIF')}</h2>
			<label for={`${uid}-gif-caption`}>{t('Текст подписи', 'Caption text')}</label><textarea
				id={`${uid}-gif-caption`}
				rows={4}
				maxlength={300}
				bind:value={caption.text}></textarea>
			<label class="uppercase-toggle"
				><input type="checkbox" bind:checked={caption.uppercase} />Uppercase</label
			>
			<label for={`${uid}-caption-size`}
				>{t('Размер', 'Size')}<span>{caption.fontSize}px</span></label
			><input
				id={`${uid}-caption-size`}
				type="range"
				min="16"
				max="72"
				bind:value={caption.fontSize}
			/>
			<label for={`${uid}-caption-font`}>{t('Шрифт', 'Font')}</label><select
				id={`${uid}-caption-font`}
				bind:value={caption.fontFamily}
				>{#each fonts as font (font.family)}<option value={font.family}>{font.label}</option
					>{/each}</select
			>
			<label for={`${uid}-caption-align`}>{t('Выравнивание', 'Alignment')}</label><select
				id={`${uid}-caption-align`}
				bind:value={caption.align}
				><option value="left">{t('Слева', 'Left')}</option><option value="center"
					>{t('По центру', 'Center')}</option
				></select
			>
			<label for={`${uid}-caption-padding`}
				>{t('Отступы', 'Padding')}<span>{caption.padding}px</span></label
			><input
				id={`${uid}-caption-padding`}
				type="range"
				min="4"
				max="30"
				bind:value={caption.padding}
			/>
			<label class="file-button"
				>{t('Загрузить свою GIF', 'Upload your GIF')}<input
					type="file"
					accept="image/gif,.gif"
					onchange={upload}
				/></label
			>
			{#if name}<p class="hint file-name">{name}</p>{/if}

		</fieldset>
	</section>
</div>
