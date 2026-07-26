<script lang="ts">
	import { apps, type App } from "$lib/data/appslist";
	import { fly } from 'svelte/transition';
	import { dropDownTransition } from '$lib/animations';


	let { onOpen, isVisible, onOuterLauncherClick }: { onOpen: (app: App) => void, isVisible: boolean, onOuterLauncherClick: () => void } = $props();

</script>

<!-- markup (zero or more items) goes here -->
{#if isVisible}
    <div class="launcher-outer-zone" onclick={onOuterLauncherClick}></div>
    <div class="launcher-container" transition:fly={dropDownTransition}>
        {#each apps as appItem (appItem.id)}
            <button
                class="app-container"
                onclick={() => onOpen(appItem)}
            >
                <div class="app-name">{appItem.name}</div>
                <div class="app-description">{appItem.description}</div>
            </button>
        {/each}
    </div>
{/if}

<style>
    .launcher-outer-zone{
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
    }
    .launcher-container{
        position: fixed;
        left: 10px;
        top: 40px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        width: 400px;
        gap: 14px;
        background: var(--color-window-bg);
        border: 1px solid var(--color-border);
        z-index: 1001;
        border-radius: 8px;
        box-shadow: 0 12px 32px rgba(0,0,0,.45);
    }

    .app-container{
        background: var(--color-surface);
        text-align: left;
        padding: 14px;
        border: none;
        display: flex;
        flex-direction: column;
        color: var(--color-text-primary);
        transition: .15s;
        border-radius: 6px;
    }

    .app-container:hover {
        background: var(--color-surface-active);
        cursor: pointer;
    }

    .app-name{
        font-weight: 500;
        color: var(--color-text-primary);
    }

    .app-description{
        color: var(--color-text-muted);
    }
</style>
