<script lang="ts">
	import { github_logo } from "$lib/files/ascii_logos/github";
	import { email_logo } from "$lib/files/ascii_logos/mail";
	import { telegram_logo } from "$lib/files/ascii_logos/telegram";

	const links = [
    {
        name: 'GitHub',
        logo: github_logo,
        link: 'https://github.com/Rame956'
    },
    {
        name: 'Telegram',
        logo: telegram_logo,
        link: 'https://t.me/Rame958'
    },
    {
        name: 'Email',
        logo: email_logo,
        link: null
    }
	];

	const projects = [
     	{
     	  name: 'rame-web',
     	  link: 'https://github.com/Rame956/rame-web',
     	  description: 'Сайт, на котором вы сейчас находитесь)'
     	},
	]
</script>

<div class="tui">
    <div class='command-line'>rame@rame.wtf:~$ linksfetch</div>
    <div class='command-line'>Contacts:</div>
    <div class='links-grid'>
        {#each links as item (item.name)}
            {#if item.link}
                <a
                    class="link-container"
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                >
                    <pre class="logo">{item.logo}</pre>
                    <span class="link">{item.link}</span>
                </a>
            {:else}
                <div class="link-container disabled">
                    <pre class="logo">{item.logo}</pre>
                    <span class="link">SOON</span>
                </div>
            {/if}
        {/each}
    </div>
    <div class='command-line'>Projects:</div>
    <div class="projects-list">
        {#each projects as item (item.name)}
            <a
                class="project-link-container"
                href={item.link}
                target="_blank"
                rel="noreferrer"
            >
                <span class="project-name">{item.name}</span>
                <span class="project-description">{item.description}</span>
            </a>
        {/each}
    </div>
</div>

<style>
    .links-grid {
        padding: 16px;

        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 24px;
    }

    .link-container {
        min-width: 0;
        padding: 16px;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;

        color: var(--text);
        text-decoration: none;

        border: 1px solid var(--border);
        border-radius: 8px;
    }

    .projects-list {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .project-link-container {
        min-width: 0;
        padding: 10px 12px;

        display: flex;
        flex-direction: row;
        gap: 8px;

        color: var(--text);
        text-decoration: none;

        border: 1px solid var(--border);
        border-radius: 8px;
    }

    .project-link-container:hover {
        border-color: var(--accent);
        background: var(--surface-active);
    }

    .project-name {
        flex-shrink: 0;
        color: var(--accent);
        font-weight: 600;
    }

    .project-description {
        color: var(--text-muted);
    }

    a.link-container:hover {
        border-color: var(--accent);
        background: var(--surface-active);
    }

    .disabled {
        opacity: 0.5;
    }

	.logo {
        margin: 0;
        padding: 0;

        color: var(--accent);

        font-family:
            "JetBrains Mono",
            "Noto Sans Mono",
            monospace;

        font-size: 14px;
        line-height: 1;

        white-space: pre;
        overflow: hidden;
    }

    .link {
        max-width: 100%;
        overflow-wrap: anywhere;
        text-align: center;
        font-size: 14px;
    }
</style>
