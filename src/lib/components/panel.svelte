<script lang="ts">
    import { onMount } from "svelte";
    import Icon from "@iconify/svelte"

	let { main_panel_title, onLauncherClick, onWebringsClick, onLanguageClick }: {main_panel_title?: string, onLauncherClick: () => void, onWebringsClick: () => void, onLanguageClick: () => void} = $props();

	let now = $state(new Date());

	let timer: ReturnType<typeof setInterval>;

	onMount(() => {
    timer = setInterval(() => {
        now = new Date();
    }, 1000);

    return () => clearInterval(timer);
	});
</script>

<div class="panel">

    <div class="left">
        <button class="launch-app sub-panel" onclick={onLauncherClick}>
            <div>Applications</div>
            <Icon icon="material-symbols:rocket-launch" width=20/>
        </button>
    </div>

    <div class="center">
        <div class="main-panel">{main_panel_title}</div>
    </div>

    <div class="right">
        <button class="webring-panel sub-panel" onclick={onLanguageClick}>
            <Icon icon="material-symbols:globe" width=24/>
            <Icon icon="material-symbols:arrow-drop-down" width=24/>
        </button>
        <button class="webring-panel sub-panel" onclick={onWebringsClick}>
            <div>Webrings</div>
            <Icon icon="material-symbols:arrow-drop-down" width=24/>
        </button>
        <div class="date-panel sub-panel">
            <div class="time-line">{now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })}</div>

            <div class="date-line">{now.toLocaleDateString([], {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })}</div>
        </div>
    </div>
</div>

<style>
    .panel {
        position: fixed;
        top: 0;
        left: 0;

        width: 100%;
        height: 40px;
        padding: 4px 8px;

        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        align-items: center;
        gap: 8px;

        z-index: 1000;
        user-select: none;
    }

    .sub-panel {
        background: var(--color-surface);
        color: var(--color-text);

        border: 1px solid var(--color-border);
        border-radius: 8px;
    }

    .launch-app {
        width: 125px;
        height: 32px;

        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        font-weight: 600;

        border-radius: 8px;

        cursor: pointer;
        color: #fff;
    }

    .main-panel {
        width: 440px;
        height: 32px;
        background: rgba(16, 16, 16, 0.9);
        border-color: rgba(239, 35, 60, 0.45);
        color: var(--color-text);

        box-shadow:
            0 4px 18px rgba(0, 0, 0, 0.45),
            inset 0 0 12px rgba(239, 35, 60, 0.04);

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 8px;
    }

    .date-panel {
        width: 150px;
        height: 32px;

        display: flex;
        gap: 16px;
        align-items: center;
        justify-content: center;

        border-radius: 8px;
    }

    .webring-panel{
        width: auto;
        height: 32px;
        padding: 0 0 0 8px;
        display: flex;
        align-items: center;
        justify-items: center;
        cursor: pointer;

    }

	.left {
    display: flex;
    justify-content: flex-start;
    gap: 8px;
	}

	.center {
    display: flex;
    justify-content: center;
	}

	.right {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
	}
</style>
