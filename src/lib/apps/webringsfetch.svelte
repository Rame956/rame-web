<script lang="ts">
  import type { WebringData } from "$lib/data/webrings";
  import { webrings } from "$lib/data/webrings";

  let { webringData, isWebringLoading, webringErrors }: {
      	webringData: Record<string, WebringData>,
      	isWebringLoading: boolean,
      	webringErrors: Record<string, string>
	} = $props();
</script>

<div class="tui">
    <div class='command-line'>rame@rame.wtf:~$ webringsfetch</div>
    <div class='command-line'>Webrings:</div>
    {#each webrings as webring (webring.id)}
        {#if webring.isActive}
        {#if isWebringLoading}
				<span>Loading...</span>

			{:else if webringErrors[webring.id]}
				<span>
					Failed to load: {webringErrors[webring.id]}
				</span>

			{:else if webringData[webring.id]}
				{@const data = webringData[webring.id]}
				<div class="webring">
					<div class="webring-name">{webring.name}</div>

					<div class="line">
						<span class="label">prev:</span>

						<a
							class="value"
							href={data.prev?.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							{#if data.prev?.favicon}
								<img
									src={webring.faviconsUrl + data.prev.favicon}
									alt=""
								/>
							{/if}

							← {data.prev?.name}
						</a>
					</div>

					<div class="line">
						<span class="label">Ring:</span>

						<a
							class="value"
							href={webring.apiBaseUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							{webring.name}
						</a>
					</div>

					<div class="line">
						<span class="label">Next:</span>

						<a
							class="value"
							href={data.next?.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							{#if data.next?.favicon}
								<img
									src={webring.faviconsUrl + data.next.favicon}
									alt=""
								/>
							{/if}

							{data.next?.name} →
						</a>
					</div>
				</div>
			{/if}
        {:else}
				<div class="webring">
					<div class="webring-name disabled">{webring.name} (SOON)</div>
				</div>
		{/if}
    {/each}
    </div>

<style>
    .tui {
	padding: 16px;
	font-family:
		"JetBrains Mono",
		"Noto Sans Mono",
		monospace;
    }

    .command-line {
	margin-bottom: 6px;
	font-weight: 600;
	color: var(--color-text-primary);
    }

    .webring {
	margin-top: 18px;
	display: flex;
	flex-direction: column;
	gap: 6px;
    }

    .webring-name {
	color: var(--accent);
	font-weight: 700;
    }

    .line {
	min-width: 0;
	display: flex;
	gap: 8px;
    }

    .label {
	width: 90px;
	flex-shrink: 0;
	color: var(--accent);
	font-weight: 600;
    }

    .value {
	min-width: 0;
	display: inline-flex;
	align-items: center;
	gap: 6px;

	color: var(--color-text-primary);
	text-decoration: none;
	overflow-wrap: anywhere;
    }

    .value:visited {
	color: var(--color-text-primary);
    }

    .value:hover {
	color: var(--accent);
	text-decoration: underline;
    }

    .value img {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
	object-fit: contain;
    }

    .disabled{
        color: var(--color-text-muted);
    }
</style>
