<script lang="ts">
    import { onMount } from "svelte";


	let { main_panel_title, onLauncherClick }: {main_panel_title?: string, onLauncherClick: () => void} = $props();

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
        <div class="launch-app" onclick={onLauncherClick}>
            <svg width="16px" height="16px" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10 16L12 14V10L13.6569 8.34314C15.1571 6.84285 16 4.80802 16 2.68629V0H13.3137C11.192 0 9.15714 0.842855 7.65685 2.34315L6 4H2L0 6L10 16ZM10.5 7C11.3284 7 12 6.32843 12 5.5C12 4.67157 11.3284 4 10.5 4C9.67157 4 9 4.67157 9 5.5C9 6.32843 9.67157 7 10.5 7Z" fill="currentColor"/>
            <path d="M4.9274 13.7558L2.24423 11.0726L0 15L1 16L4.9274 13.7558Z" fill="currentColor"/>
            </svg>
        </div>
    </div>

    <div class="center">
        <div class="main-panel">{main_panel_title}</div>
    </div>

    <div class="right">
        <div class="date-panel">
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
    }

    .launch-app,
    .date-panel {
        background: var(--color-surface);
        color: var(--color-text);

        border: 1px solid var(--color-border);
        border-radius: 8px;
    }

    .launch-app {
        width: 32px;
        height: 32px;

        display: flex;
        align-items: center;
        justify-content: center;

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
