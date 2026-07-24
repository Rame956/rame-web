<script lang="ts">
    import MarkdownIt from 'markdown-it';

    export type FileData = {
        name: string;
        text: string;
    };

    let { file }: { file: FileData } = $props();

    const md = new MarkdownIt({
        html: false,
        linkify: true,
        typographer: true
    });

    let renderedText = $derived(md.render(file.text));
</script>

<!-- markup (zero or more items) goes here -->
<div class="tui">
    <div class="banner">
        <div class="banner-text">GNU mdview</div>
        <div class="banner-text">{file.name}</div>
    </div>
    <div class="info">
        {@html renderedText}
    </div>
</div>

<style>


	.banner {
        width: 100%;
        padding-left: 20px;
        background: var(--color-text-primary);

        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;

        z-index: 1000;
    }

    .banner-text{
        color: var(--color-surface-active);
    }

    .info {
        flex: 1;
        overflow: auto;

        padding: 16px 20px;
        box-sizing: border-box;
    }

        .info > * {
            max-width: 100%;
            min-width: 0;
        }

        .info :global(*) {
            max-width: 100%;
            min-width: 0;
            overflow-wrap: break-word;
            word-break: break-word;
        }

    .info :global(p),
    .info :global(li),
    .info :global(h1),
    .info :global(h2),
    .info :global(h3) {
        max-width: 100%;
        white-space: normal;
        overflow-wrap: anywhere;
    }

    .info :global(p) {
        margin: 0 0 18px;
    }

    .info :global(h1),
    .info :global(h2),
    .info :global(h3) {
        margin: 0 0 12px;
        line-height: 1.25;
    }

    .info :global(ul),
    .info :global(ol) {
        margin: 0 0 18px;
        padding-left: 24px;
    }

    .info :global(a) {
        color: var(--accent);
    }

    .info :global(code) {
        font-family: inherit;
    }
</style>
