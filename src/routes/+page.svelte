<svelte:head>
	<title>UNDER_CONSTRUCTRION</title>
	<meta
		name="description"
		content="А что тут собсна говорить? Ничего нет пока что"
	/>
</svelte:head>

<main>
	<section class="hero">
		<p class="domain">rame.wtf</p>

		<h1>Work in progress</h1>

		<img src="/pics/ded-stroit.gif" alt='Дед ебашит ебать как' width="300"/>

		<p class="description">
		Скоро тут будет поживее (Я ему уже сказал, что тут будет пивнуха)
		</p>

		<nav>
			<a href="#projects">Что-то</a>
			<a href="https://www.youtube.com/watch?v=qnSJwg-9xFU" target="_blank" rel="noreferrer">ГАЙД: КАК СОЗДАТЬ ПАПКУ?!?!?!?!??!?</a>
			<a href="mailto:mail@rame.wtf">Связаться(не надо умоляю)</a>
		</nav>
	</section>
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		font-family:
			Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
			sans-serif;
		background: #0d1117;
		color: #f0f6fc;
	}



	main {
		width: min(960px, calc(100% - 40px));
		margin: 0 auto;
	}

	.hero {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.domain {
		margin: 0 0 12px;
		color: #8b949e;
		font-family: monospace;
	}

	h1 {
		margin: 0;
		font-size: clamp(48px, 9vw, 96px);
		line-height: 0.95;
		letter-spacing: -0.06em;
	}

	.description {
		max-width: 650px;
		margin: 32px 0;
		color: #b1bac4;
		font-size: 20px;
		line-height: 1.6;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		margin-top: 40px;
	}

	a {
		color: #58a6ff;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
