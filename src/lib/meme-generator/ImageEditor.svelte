<script lang="ts">
	const uid = $props.id();
	import { onMount } from 'svelte';
	import {
		clampPosition,
		createImageDocument,
		createTextLayer,
		fonts,
		imageTemplates,
		type Locale,
		type ImageDocument
	} from './model';
	import { renderImage, textBounds } from './renderer';
	import { loadImage, loadImageFile } from './media';
	import { downloadBlob, pngBlob } from './export';
	let { locale }: { locale: Locale } = $props();
	const t = (ru: string, en: string) => (locale === 'ru' ? ru : en);
	let doc = $state<ImageDocument>(createImageDocument(imageTemplates[0]));
	let selectedId = $state('initial');
	let selected = $derived(doc.layers.find((layer) => layer.id === selectedId));
	let templateId = $state(imageTemplates[0].id);
	let image = $state<HTMLImageElement>();
	let canvas: HTMLCanvasElement;
	let loading = $state(true);
	let busy = $state(false);
	let message = $state('');
	let customName = $state('');
	let customFont = $state('');
	let fontFace: FontFace | undefined;
	let alive = true;
	let request = 0;
	let nextLayerId = 1;
	let drag: { pointer: number; x: number; y: number; id: string } | undefined;

	onMount(() => {
		chooseTemplate(imageTemplates[0].id);
		return () => {
			alive = false;
			request++;
			if (fontFace) document.fonts.delete(fontFace);
		};
	});
	$effect(() => {
		if (canvas && image) renderImage(canvas, doc, image, selectedId);
	});

	async function chooseTemplate(id: string) {
		const template = imageTemplates.find((entry) => entry.id === id);
		if (!template) return;
		const version = ++request;
		loading = true;
		message = '';
		try {
			const loaded = await loadImage(template.src);
			if (!alive || version !== request) return;
			doc = createImageDocument(template);
			image = loaded;
			templateId = id;
			selectedId = 'initial';
			customName = '';
		} catch {
			if (alive && version === request)
				message = t('Не удалось открыть шаблон.', 'Could not load the template.');
		} finally {
			if (alive && version === request) loading = false;
		}
	}
	async function upload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		const version = ++request;
		loading = true;
		message = '';
		try {
			const loaded = await loadImageFile(file);
			if (!alive || version !== request) return;
			// Keep layers when replacing the background; normalized positions remain meaningful.
			const ratio = loaded.naturalWidth / doc.width;
			doc = {
				width: loaded.naturalWidth,
				height: loaded.naturalHeight,
				layers: doc.layers.map((layer) => ({
					...layer,
					fontSize: Math.round(layer.fontSize * ratio)
				}))
			};
			image = loaded;
			templateId = '';
			customName = file.name;
		} catch {
			if (alive && version === request)
				message = t(
					'Не удалось открыть картинку. Максимум 20 МБ.',
					'Could not open the image. Maximum 20 MB.'
				);
		} finally {
			if (alive && version === request) loading = false;
		}
	}
	async function uploadFont(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		try {
			if (file.size > 5 * 1024 * 1024) throw new Error('Font too large');
			const next = new FontFace(
				`MemeFont${crypto.randomUUID().replaceAll('-', '')}`,
				await file.arrayBuffer()
			);
			await next.load();
			if (!alive) return;
			if (fontFace) {
				const oldFamily = fontFace.family;
				doc.layers.forEach((layer) => {
					if (layer.fontFamily === oldFamily) layer.fontFamily = next.family;
				});
				document.fonts.delete(fontFace);
			}
			document.fonts.add(next);
			fontFace = next;
			customFont = next.family;
			if (selected) selected.fontFamily = next.family;
		} catch {
			if (alive)
				message = t(
					'Не удалось загрузить шрифт (до 5 МБ).',
					'Could not load the font (up to 5 MB).'
				);
		}
	}
	function addText() {
		if (doc.layers.length >= 12) return;
		const layer = createTextLayer(`text-${nextLayerId++}`, doc.width, t('Новый текст', 'New text'));
		doc.layers.push(layer);
		selectedId = layer.id;
	}
	function removeText() {
		doc.layers = doc.layers.filter((layer) => layer.id !== selectedId);
		selectedId = doc.layers.at(-1)?.id ?? '';
	}
	function startDrag(event: PointerEvent) {
		if (busy || loading) return;
		const rect = canvas.getBoundingClientRect();
		const x = (event.clientX - rect.left) / rect.width,
			y = (event.clientY - rect.top) / rect.height;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const hit = [...doc.layers].reverse().find((layer) => {
			const bounds = textBounds(ctx, layer, doc);
			return (
				x * doc.width >= bounds.left - 12 &&
				x * doc.width <= bounds.left + bounds.width + 12 &&
				y * doc.height >= bounds.top - 12 &&
				y * doc.height <= bounds.top + bounds.height + 12
			);
		});
		if (!hit) return;
		selectedId = hit.id;
		drag = { pointer: event.pointerId, x: x - hit.x, y: y - hit.y, id: hit.id };
		canvas.setPointerCapture(event.pointerId);
	}
	function moveDrag(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.pointer) return;
		const layer = doc.layers.find((entry) => entry.id === drag?.id);
		if (!layer) return;
		const rect = canvas.getBoundingClientRect();
		layer.x = clampPosition((event.clientX - rect.left) / rect.width - drag.x);
		layer.y = clampPosition((event.clientY - rect.top) / rect.height - drag.y);
	}
	async function save(copy = false) {
		if (!image) return;
		busy = true;
		message = '';
		try {
			const output = document.createElement('canvas');
			output.width = doc.width;
			output.height = doc.height;
			renderImage(output, doc, image);
			const blob = pngBlob(output);
			if (copy) {
				if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined')
					throw new Error('Clipboard unavailable');
				await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
				if (alive) message = t('Картинка скопирована.', 'Image copied.');
			} else {
				const result = await blob;
				if (alive) downloadBlob(result, 'meme.png');
			}
		} catch {
			if (alive)
				message = copy
					? t('Копирование недоступно. Сохраните PNG.', 'Copy unavailable. Save PNG instead.')
					: t('Не удалось сохранить картинку.', 'Could not save the image.');
		} finally {
			if (alive) busy = false;
		}
	}
</script>

<div class="editor-grid">
	<section class="preview-pane" aria-label={t('Предпросмотр картинки', 'Image preview')}>
		<div class="template-list">
			{#each imageTemplates as template (template.id)}<button
					aria-label={template.name[locale]}
					aria-pressed={templateId === template.id}
					class:active={templateId === template.id}
					disabled={busy}
					onclick={() => chooseTemplate(template.id)}><img src={template.src} alt="" /></button
				>{/each}
		</div>
		<div class="preview-stage">
			{#if loading}<p class="loading">{t('Загрузка…', 'Loading…')}</p>{/if}
			<canvas
				bind:this={canvas}
				width={doc.width}
				height={doc.height}
				aria-label={t(
					'Мем. Перетащите выбранный текст или используйте ползунки положения.',
					'Meme. Drag a text layer or use the position sliders.'
				)}
				onpointerdown={startDrag}
				onpointermove={moveDrag}
				onpointerup={() => (drag = undefined)}
				onpointercancel={() => (drag = undefined)}
				onlostpointercapture={() => (drag = undefined)}
			></canvas>
		</div>
		<p class="hint">
			{t(
				'Нажмите на текст и перетащите его.',
				'Click and drag a text layer.'
			)}
		</p>
		<div class="export-actions">
			<button class="primary" onclick={() => save()} disabled={busy || loading || !image}
				>{t('Сохранить PNG', 'Save PNG')}</button
			><button onclick={() => save(true)} disabled={busy || loading || !image}
				>{t('Копировать', 'Copy image')}</button
			><span class="hint">{doc.width} × {doc.height}</span>
		</div>
		<p class="status" role="status">{message}</p>
	</section>
	<section class="controls" aria-label={t('Редактор картинки', 'Image editor')}>
		<fieldset disabled={busy || loading}>
			<label class="file-button"
				>{t('Загрузить свою картинку', 'Upload your image')}<input
					type="file"
					accept="image/png,image/jpeg,image/webp"
					onchange={upload}
				/></label
			>
			{#if customName}<p class="hint file-name">{customName}</p>{/if}
			<div class="control-heading">
				<h2>{t('Текстовые слои', 'Text layers')}</h2>
				<span>{doc.layers.length}/12</span>
			</div>
			<div class="layer-list">
				{#each doc.layers as layer, index (layer.id)}<button
						class:active={selectedId === layer.id}
						onclick={() => (selectedId = layer.id)}
						>{index + 1}. {layer.text || t('Пустой текст', 'Empty text')}</button
					>{/each}
			</div>
			<button onclick={addText} disabled={doc.layers.length >= 12}
				>+ {t('Добавить текст', 'Add text')}</button
			>
			{#if selected}
				<label for={`${uid}-layer-text`}>{t('Текст', 'Text')}</label><textarea
					id={`${uid}-layer-text`}
					rows={3}
					maxlength={300}
					bind:value={selected.text}></textarea>
				<label class="uppercase-toggle"
					><input type="checkbox" bind:checked={selected.uppercase} />Uppercase</label
				>
				<label for={`${uid}-layer-font`}>{t('Шрифт', 'Font')}</label><select
					id={`${uid}-layer-font`}
					bind:value={selected.fontFamily}
					>{#each fonts as font (font.family)}<option value={font.family}>{font.label}</option
						>{/each}{#if customFont}<option value={customFont}
							>{t('Мой шрифт', 'Custom font')}</option
						>{/if}</select
				>
				<label class="file-button"
					>{t('Загрузить шрифт', 'Upload font')}<input
						type="file"
						accept=".woff,.woff2,.ttf,.otf"
						onchange={uploadFont}
					/></label
				>
				<label for={`${uid}-layer-size`}
					>{t('Размер', 'Size')}<span>{selected.fontSize}px</span></label
				><input
					id={`${uid}-layer-size`}
					type="range"
					min="12"
					max={Math.max(200, Math.round(doc.width * 0.3))}
					bind:value={selected.fontSize}
				/>
				<label class="color-label"
					>{t('Цвет текста', 'Text color')}<input type="color" bind:value={selected.color} /></label
				>
				<label for={`${uid}-layer-outline`}
					>{t('Обводка', 'Outline')}<span>{selected.outline}</span></label
				><input
					id={`${uid}-layer-outline`}
					type="range"
					min="0"
					max="10"
					bind:value={selected.outline}
				/>
				<label class="color-label"
					>{t('Цвет обводки', 'Outline color')}<input
						type="color"
						bind:value={selected.outlineColor}
					/></label
				>
				<details>
					<summary>{t('Неоновое свечение', 'Neon glow')}</summary><label for={`${uid}-layer-glow`}
						>{t('Сила', 'Strength')}<span>{selected.glow}</span></label
					><input
						id={`${uid}-layer-glow`}
						type="range"
						min="0"
						max="60"
						bind:value={selected.glow}
					/><label class="color-label"
						>{t('Цвет свечения', 'Glow color')}<input
							type="color"
							bind:value={selected.glowColor}
						/></label
					>
				</details>
				<details>
					<summary>{t('Положение', 'Position')}</summary><label for={`${uid}-layer-x`}>X</label
					><input
						id={`${uid}-layer-x`}
						type="range"
						min="0"
						max="1"
						step="0.01"
						bind:value={selected.x}
					/><label for={`${uid}-layer-y`}>Y</label><input
						id={`${uid}-layer-y`}
						type="range"
						min="0"
						max="1"
						step="0.01"
						bind:value={selected.y}
					/><button
						onclick={() => {
							if (selected) {
								selected.x = 0.5;
								selected.y = 0.5;
							}
						}}>{t('По центру', 'Center')}</button
					>
				</details>
				<button class="danger" onclick={removeText}
					>{t('Удалить этот текст', 'Delete this text')}</button
				>
			{:else}<p class="hint">
					{t(
						'Добавьте текст или сохраните картинку без подписей.',
						'Add a text layer or save the image without text.'
					)}
				</p>{/if}
		</fieldset>
	</section>
</div>
