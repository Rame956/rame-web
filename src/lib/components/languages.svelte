<script lang="ts">
    import { fly } from 'svelte/transition';
	import { dropDownTransition } from '$lib/animations';

	let { isVisible, onOuterlanguagesClick, currentlocale}: {
     	isVisible: boolean,
     	onOuterlanguagesClick: () => void,
        currentlocale: 'ru' | 'en'
	} = $props();


</script>

<!-- markup (zero or more items) goes here -->
{#if isVisible}
    <div class="languages-outer-zone" onclick={onOuterlanguagesClick}></div>
    <div class="language-container" transition:fly={dropDownTransition}>
        <div class="languages-container">
            <span class="marker">
                {#if currentlocale === 'ru'}→{/if}
            </span>
            <a class="languages-link" href="/">Russian</a>
        </div>
        <div class="languages-container">
            <span class="marker">
                {#if currentlocale === 'en'}→{/if}
            </span>
            <a class="languages-link" href="/en">English</a>
        </div>
    </div>
{/if}

<style>
    .languages-outer-zone{
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
    }
    .language-container{
        position: fixed;
        right: 225px;
        top: 40px;
        padding: 14px;
        width: min(150px, calc(100vw - 20px));
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 14px;
        background: var(--color-window-bg);
        border: 1px solid var(--color-border);
        z-index: 1001;
        border-radius: 8px;
        box-shadow: 0 12px 32px rgba(0,0,0,.45);
    }

    .languages-container {
    	background: var(--color-surface);
        height: 50px;
    	padding: 14px;
        display: flex;
    	align-items: center;
        justify-content: center;
    	gap: 5px;
    	color: var(--color-text-primary);
    	border-radius: 6px;

    }

    .languages-link:hover {
        color: var(--color-text-primary);
    }

    .languages-link {
    	min-width: 0;
        text-decoration: none;
    	text-align: center;
    	color: var(--color-text-primary);
    	overflow: hidden;
    	text-overflow: ellipsis;
    	white-space: nowrap;
    }
</style>
