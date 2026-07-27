<script lang="ts">
    import { onMount } from "svelte";


    let visibleLines = $state<{label: string, value: string}[]>([]);
    function getAge(birthDate: Date): number {
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();

        const birthdayPassed =
            today.getMonth() > birthDate.getMonth() ||
            (
                today.getMonth() === birthDate.getMonth() &&
                today.getDate() >= birthDate.getDate()
            );

        if (!birthdayPassed) {
            age--;
        }

        return age;
    }

    const systemInfo = [
        { label: 'Name', value: 'Rame' },
        { label: 'Age', value: getAge(new Date(2003, 2, 20)).toString() },
        { label: 'About', value: 'Developer, Linux-lover, Shitposter, Walking joke' },
        { label: 'Location', value: 'Russia' },
        { label: 'Last Sleep', value: 'Who' },
        { label: 'Current role', value: 'DevOps + Frontend dev (developing to fullstack)' },
        {
            label: 'Skills',
            value: 'TypeScript, JavaScript, C++/Qt, Svelte, React, Linux, Docker, Git, Go (learning)'
        },
        { label: 'Current editor', value: 'Zed' },
        { label: 'Languages', value: 'RU, EN' },
        { label: 'Status', value: 'Alive (kinda)' }
    ];

    const sleep = (millsec: number) =>
	   new Promise<void>((resolve) => setTimeout(resolve, millsec));

	onMount(async () => {
		await sleep(400);

		for (const line of systemInfo) {
			visibleLines = [...visibleLines, line];
			await sleep(150 + Math.random() * 250);
		}
	});
</script>

<!-- markup (zero or more items) goes here -->
<div class="tui">
    <div class="ramefetch">
<pre class="logo">
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣬⣤⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢠⣶⠟⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⡀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢠⣿⠏⣼⣿⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣾⣿⡆⣿⣿⡃⣿⣧⣝⢿⡻⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣿⣿⣿⢸⣿⣴⣾⣿⣿⣯⣳⣜⢿⣿⣿⣿⣿⡇⠀⠀⠀
⠀⠀⠀⠀⡌⣿⣿⣿⡈⣿⢀⣤⣤⣭⡉⠙⢿⡏⣿⣿⣿⣿⡇⠀⠀⠀
⠀⠀⠀⢀⢸⡟⣿⣿⢷⡌⢸⣿⣿⣿⣿⣷⡜⢷⣿⣿⣿⣿⡇⠀⠀⠀
⠀⠀⠀⠸⢘⡀⢻⣿⣦⡀⣙⡛⠛⠛⠿⠿⠿⢸⣿⣿⣿⣿⠃⠀⠀⠀
⠀⠀⠀⠀⢰⠀⢠⣍⠙⠻⣿⣿⣿⣷⣶⣦⠀⣾⣿⣿⣿⠃⠀⠀⠀⠀
⠀⠀⠀⠀⠈⢦⣾⢹⣿⣦⢘⣋⡁⠀⠀⢙⠃⣿⣿⠟⠁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠈⢻⣾⣿⡏⠸⣿⡿⠿⠿⠟⢀⣡⣄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⣾⠟⠀⠀⠠⢤⣼⣿⣆⢻⣿⣿⣷⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠘⠁⣊⣐⡀⣴⣶⡼⠟⣡⣾⣿⣿⣿⣷⡀⠀⠀⠀⠀
⠀⠀⠀⠀⡀⠀⢀⣴⣿⣿⣿⠿⠋⠀⠘⣻⣿⡿⢻⣿⣿⣿⢆⠀⠀⠀
⠀⠀⠀⣠⡅⠐⢿⣙⠾⠿⠁⣰⣶⡾⢘⣋⣩⣾⡆⣿⣿⣿⣿⡆⠀⠀
⠀⠀⠀⣿⡇⠀⠀⠙⠷⢷⣶⣭⣍⡁⣾⣿⣿⣿⡗⣿⣿⣿⣿⠇⠀⠀
⠀⠀⠀⢿⡇⠀⠀⠀⠀⠀⣿⣶⣶⡄⢿⡛⠛⠛⠛⣸⠿⢏⠉⠀⠀⠀
⠀⠀⠀⠀⠃⠀⠀⠀⠀⠀⠙⠛⠛⠁⠀⠈⠁⠀⠁⠀⠀⠀⠀⠀⠀⠀</pre>
        <div class="info">
            <div class="line">rame@rame.wtf</div>
            <div class="line">-------------</div>
            {#each visibleLines as line (line)}
          		<div class="line">
          		    <div class="label">{line.label + ':'}</div>
         			<div class="value">{line.value}</div>
                </div>
           	{/each}
        </div>
    </div>


</div>


<style>
    .ramefetch{
        padding: 20px;
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 32px;
        align-items: start;
    }

    .logo {
        margin: 0;
        padding: 0;

        color: var(--accent);

        font-family:
            "JetBrains Mono",
            "Noto Sans Mono",
            monospace;

        font-size: 11px;
        line-height: 1;

        white-space: pre;
        overflow: hidden;
    }

    .info{
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .line {
        font-weight: 600;
        display: flex;
        gap: 8px;
    }

    .label {
        width: 90px;
        flex-shrink: 0;
        color: var(--accent);
    }

    .value {
        flex: 1;
        color: var(--accent);
    }

    @media (max-width: 640px) {
	.ramefetch {
		grid-template-columns: 1fr;
		gap: 20px;
		padding: 12px;
	}

	.logo {
		font-size: 8px;
		justify-self: center;
		max-width: 100%;
		overflow-x: auto;
	}

	.info {
		min-width: 0;
	}
    }
</style>
