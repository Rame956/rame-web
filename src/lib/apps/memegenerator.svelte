<script lang="ts">
	import MemeEditor from '$lib/meme-generator/MemeEditor.svelte';
	let { currentLocale = 'ru' }: { currentLocale?: 'ru' | 'en' } = $props();
</script>

<MemeEditor {currentLocale} />
