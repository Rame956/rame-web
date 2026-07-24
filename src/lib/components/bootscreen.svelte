<script lang="ts">
	import { onMount } from "svelte";

      let {
              onComplete
          }: {
              onComplete: () => void;
          } = $props();

	type BootPhase = 'logs' | 'blackout' | 'plymouth' | 'finished';
	let phase = $state<BootPhase>('logs');
	let visibleLines = $state<string[]>([]);

	const bootLines = [
			'[  OK  ] Mounted /projects.',
			'[  OK  ] Mounted /memes.',
			'[  OK  ] Started docker.service.',
			'[  OK  ] Loaded monster_energy module.',
			'[  OK  ] Connected to rame.wtf.',
			'[  OK  ] Started graphical interface.'
		];

	const sleep = (millsec: number) =>
	   new Promise<void>((resolve) => setTimeout(resolve, millsec));

	onMount(async () => {
		await sleep(400);

		for (const line of bootLines) {
			visibleLines = [...visibleLines, line];
			await sleep(150 + Math.random() * 250);
		}

		await sleep(300);

		phase = 'blackout';
		await sleep(120);

		phase = 'plymouth';

		await sleep(5500);

		phase = 'finished';
		onComplete();
	});

</script>

<!-- разметка -->
{#if phase !== 'finished'}
	<div
		class:plymouth={phase === 'plymouth'}
		class:blackout={phase === 'blackout'}
		class="boot-screen"
	>
		{#if phase === 'logs'}
			<div class="boot-log">
				<div class="boot-title">Booting RameOS...</div>

				{#each visibleLines as line (line)}
					<div class="boot-line">
						{line}
					</div>
				{/each}
			</div>
		{:else if phase === 'plymouth'}
			<div class="plymouth-screen">
				<div class="logo">RAME<span>.WTF</span></div>

				<div class="loader">
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>

				<div class="status">Starting desktop environment</div>
			</div>
		{/if}
	</div>
{/if}


<style>
    .boot-screen {
		position: fixed;
		inset: 0;
		z-index: 9999;

		display: flex;
		align-items: flex-start;
		justify-content: flex-start;

		box-sizing: border-box;
		padding: 32px;

		background: #050505;
		color: #d8d8d8;

		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 15px;
	}

	.os-logs {
		width: 100%;
	}

	.os-title {
		margin-bottom: 20px;
		color: #ef233c;
	}

	.boot-line {
		margin-bottom: 7px;
		animation: line-appear 100ms linear;
	}

	.boot-line::first-letter {
		color: #ef233c;
	}

	.warning {
		color: #f4b942;
	}

	.cursor {
		display: inline-block;
		width: 8px;
		height: 16px;
		margin-top: 8px;

		background: #ef233c;
		animation: blink 700ms steps(1) infinite;
	}

	.boot-screen {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: #050505;
	}

	.blackout {
		padding: 0;
	}

	.plymouth {
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.plymouth-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.logo {
		margin-bottom: 32px;

		color: #f1f1f1;
		font-size: 36px;
		font-weight: 700;
		letter-spacing: 8px;
	}

	.logo span {
		color: #ef233c;
	}

	.loader {
		display: flex;
		gap: 10px;
		height: 14px;
	}

	.loader span {
		width: 8px;
		height: 8px;

		border-radius: 50%;
		background: #ef233c;

		animation: loading-dot 1s ease-in-out infinite;
	}

	.loader span:nth-child(2) {
		animation-delay: 100ms;
	}

	.loader span:nth-child(3) {
		animation-delay: 200ms;
	}

	.loader span:nth-child(4) {
		animation-delay: 300ms;
	}

	.loader span:nth-child(5) {
		animation-delay: 400ms;
	}

	.status {
		margin-top: 24px;
		color: #777;
		font-size: 12px;
		letter-spacing: 1px;
	}

	@keyframes line-appear {
		from {
			opacity: 0;
			transform: translateY(2px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	@keyframes loading-dot {
		0%,
		100% {
			opacity: 0.2;
			transform: translateY(0);
		}

		50% {
			opacity: 1;
			transform: translateY(-5px);
		}
	}

	@keyframes switch-screen {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.boot-screen,
		.boot-line,
		.cursor,
		.loader span {
			animation: none;
		}
	}
</style>
