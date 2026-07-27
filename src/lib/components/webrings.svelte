<script lang="ts">
	import { webrings, type WebringData } from "$lib/data/webrings";
	import { fly } from 'svelte/transition';
	import { dropDownTransition } from '$lib/animations';


	let { isVisible, onOuterwebringsClick, webringData, isWebringLoading, webringErrors }: {
     	isVisible: boolean,
     	onOuterwebringsClick: () => void,
     	webringData: Record<string, WebringData>,
     	isWebringLoading: boolean,
     	webringErrors: Record<string, string>
	} = $props();


</script>

<!-- markup (zero or more items) goes here -->
{#if isVisible}
    <div class="webrings-outer-zone" onclick={onOuterwebringsClick}></div>
    <div class="webrings-container" transition:fly={dropDownTransition}>
        {#each webrings as webring (webring.id)}
	{#if webring.isActive}
		<div class="webring-container">
			{#if isWebringLoading}
				<span>Loading...</span>

			{:else if webringErrors[webring.id]}
				<span>
					Failed to load: {webringErrors[webring.id]}
				</span>

			{:else if webringData[webring.id]}
				{@const data = webringData[webring.id]}

				<a class="webring-link webring-link-prev" href={data.prev?.url} target="_blank" rel="noopener noreferrer">
				← {data.prev?.name}
				{#if data.prev?.favicon}<img src={webring.faviconsUrl + data.prev?.favicon} width="16" height="16" alt=""/>{/if}
				</a>

				<a class="webring-link webring-title" href={webring.apiBaseUrl} target="_blank" rel="noopener noreferrer">
					{webring.name}
				</a>

				<a class="webring-link webring-link-next" href={data.next?.url} target="_blank" rel="noopener noreferrer">
				{#if data.next?.favicon}<img src={webring.faviconsUrl + data.next?.favicon} width="16" height="16" alt=""/>{/if}
				{data.next?.name} →
				</a>
			{/if}
		</div>
		{:else}
		<div class="webring-container-disabled">
		<div class="webring-link webring-title disabled">
			{webring.name + ' (SOON)'}
		</div>
		</div>
	{/if}
        {/each}
    </div>
{/if}

<style>
    .webrings-outer-zone{
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
    }
    .webrings-container{
        position: fixed;
        right: 10px;
        top: 40px;
        padding: 14px;
        width: min(400px, calc(100vw - 20px));
        box-sizing: border-box;
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

    .webring-container {
    	background: var(--color-surface);
    	padding: 14px;
    	display: grid;
    	grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    	align-items: center;
    	gap: 12px;
    	color: var(--color-text-primary);
    	border-radius: 6px;

    }

    .webring-container-disabled {
    	background: var(--color-surface);
    	padding: 14px;
    	display: grid;
    	grid-template-columns: 1fr;
    	align-items: center;
    	gap: 12px;
    	border-radius: 6px;
    }

    .webring-link:hover {
        color: var(--color-text-primary);
    }

    .webring-link {
    	min-width: 0;
        text-decoration: none;
    	text-align: center;
    	color: var(--color-text-primary);
    	overflow: hidden;
    	text-overflow: ellipsis;
    	white-space: nowrap;
    }

    .webring-link-prev {
    	text-align: left;
    	font-weight: 500;
    }

    .webring-title {
    	text-align: center;
    	font-weight: 800;
        text-decoration: underline;
    }

    .webring-link-next {
    	text-align: right;
    	font-weight: 500;
    }

    .disabled{
        color: var(--color-text-muted);
        text-align: center;
    }
</style>
