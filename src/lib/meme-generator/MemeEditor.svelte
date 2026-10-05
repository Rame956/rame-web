<script lang="ts">
	const uid = $props.id();
	import ImageEditor from './ImageEditor.svelte';
	import GifEditor from './GifEditor.svelte';
	import type { Locale } from './model';
	import './editor.css';
	let { currentLocale = 'ru' }: { currentLocale?: Locale } = $props();
	let section = $state<'image' | 'gif'>('image');
	const t = (ru: string, en: string) => (currentLocale === 'ru' ? ru : en);
</script>

<div class="meme-app">
	<header class="app-heading">
		<div>
			<span class="eyebrow">RAME / MEME LAB</span>
			<!-- <h1>Meme Studio</h1> -->
		</div>
	</header>
	<div class="section-tabs" role="tablist" aria-label={t('Тип мема', 'Meme type')}>
		<button
			id={`${uid}-image-tab`}
			role="tab"
			aria-selected={section === 'image'}
			aria-controls={`${uid}-image-section`}
			tabindex={section === 'image' ? 0 : -1}
			class:active={section === 'image'}
			onclick={() => (section = 'image')}
			onkeydown={(event) => {
				if (['ArrowLeft', 'ArrowRight', 'End'].includes(event.key)) {
					event.preventDefault();
					section = 'gif';
					document.getElementById(`${uid}-gif-tab`)?.focus();
				}
			}}>{t('Картинки', 'Images')}<span>PNG</span></button
		>
		<button
			id={`${uid}-gif-tab`}
			role="tab"
			aria-selected={section === 'gif'}
			aria-controls={`${uid}-gif-section`}
			tabindex={section === 'gif' ? 0 : -1}
			class:active={section === 'gif'}
			onclick={() => (section = 'gif')}
			onkeydown={(event) => {
				if (['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) {
					event.preventDefault();
					section = 'image';
					document.getElementById(`${uid}-image-tab`)?.focus();
				}
			}}>{t('Гифки', 'GIFs')}<span>GIF</span></button
		>
	</div>
	<div
		id={`${uid}-image-section`}
		role="tabpanel"
		aria-labelledby={`${uid}-image-tab`}
		hidden={section !== 'image'}
	>
		<ImageEditor locale={currentLocale} />
	</div>
	<div
		id={`${uid}-gif-section`}
		role="tabpanel"
		aria-labelledby={`${uid}-gif-tab`}
		hidden={section !== 'gif'}
	>
		<GifEditor locale={currentLocale} />
	</div>
</div>
