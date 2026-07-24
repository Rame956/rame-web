<script lang="ts">
	import { apps, type app } from "$lib/apps/appslist";


	let { onOpen, isVisible }: { onOpen: (app: app) => void, isVisible: boolean } = $props();

</script>

<!-- markup (zero or more items) goes here -->
{#if isVisible}
    <div class="launcher-container">
        {#each apps as appItem (appItem.id)}
            <button
                class="app-container"
                onclick={() => onOpen(appItem)}
            >
                {appItem.name}
            </button>
        {/each}
    </div>
{/if}

<style>
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
        z-index: 1000;
        border-radius: 8px;
        box-shadow: 0 12px 32px rgba(0,0,0,.45);
    }

    .app-container{
        background: var(--color-surface);
        text-align: left;
        padding: 14px;
        border: none;
        color: var(--color-text-primary);
        transition: .15s;
        border-radius: 6px;
    }

    .app-container:hover {
        background: var(--color-surface-active);
        cursor: pointer;
    }
</style>
