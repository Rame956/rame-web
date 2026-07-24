<script lang="ts">
    import type { Component } from 'svelte';
    import Applauncher from "$lib/components/applauncher.svelte";

   	import Window from '$lib/components/window.svelte';
    import Panel from '$lib/components/panel.svelte';
    import type { app } from '$lib/apps/appslist';
    import { apps } from '$lib/apps/appslist';

    type WindowData = {
            id: number;
            appId: string;
            title: string;

            width: number;
            height: number;

            x: number;
            y: number;

            zIndex: number;

            windowContent: Component<any>;
            contentProps?: Record<string, unknown>;
        };


   	let focusedWindowId = $state<number | null>(2);
    let nextZIndex = $state(3);
    let nextWindowId = $state(3);

    let isLauncherVisible: boolean = $state(false);


   	const ramefetchApp = apps.find((app) => app.id === 'ramefetch');
    const welcomeApp = apps.find((app) => app.id === 'welcome');

    if (!ramefetchApp || !welcomeApp) {
        throw new Error('Initial applications are missing');
    }

    let windows = $state<WindowData[]>([
        {
            id: 1,
            appId: ramefetchApp.id,
            title: ramefetchApp.title,
            width: ramefetchApp.width,
            height: ramefetchApp.height,
            x: 800,
            y: 550,
            zIndex: 2,
            windowContent: ramefetchApp.component,
            contentProps: ramefetchApp.props
        },
        {
            id: 2,
            appId: welcomeApp.id,
            title: welcomeApp.title,
            width: welcomeApp.width,
            height: welcomeApp.height,
            x: 70,
            y: 45,
            zIndex: 3,
            windowContent: welcomeApp.component,
            contentProps: welcomeApp.props
        }
    ]);


   	function onClose(id: number) {
        windows = windows.filter((window) => window.id !== id);

        if (focusedWindowId !== id) {
            return;
        }

        const topWindow = [...windows].sort(
            (a, b) => b.zIndex - a.zIndex
        )[0];

        focusedWindowId = topWindow?.id ?? null;
    }

   	function onFocus(id: number) {
        if (focusedWindowId === id) {
            return;
        }

        const targetWindow = windows.find((window) => window.id === id);

        if (!targetWindow) {
            return;
        }

        nextZIndex += 1;
        targetWindow.zIndex = nextZIndex;
        focusedWindowId = id;
    }

    let onLauncherClick = () => {isLauncherVisible = !isLauncherVisible};

    function onOpen(app: app) {
        nextZIndex += 1;

        const id = nextWindowId;
        nextWindowId += 1;

        const newWindow: WindowData = {
            id,
            appId: app.id,
            title: app.title,

            width: app.width,
            height: app.height,

            x: 120 + windows.length * 30,
            y: 100 + windows.length * 30,

            zIndex: nextZIndex,

            windowContent: app.component,
            contentProps: app.props
        };

        windows = [...windows, newWindow];

        focusedWindowId = id;
        isLauncherVisible = false;
    }
</script>

<svelte:head>
   	<title>Rame.WTF</title>
   	<meta
  		name="description"
  		content="Da"
   	/>
</svelte:head>

<!-- <BootScreen /> -->

<main>
    <Panel main_panel_title={windows.find((window) => window.id === focusedWindowId)?.title} onLauncherClick={onLauncherClick}/>
    <Applauncher onOpen={onOpen} isVisible={isLauncherVisible}/>
    <div class="window-environment">
        {#each windows as window (window.id)}
            <Window windowParameters={window} onClose={() => onClose(window.id)} onFocus={() => onFocus(window.id)} isFocused={focusedWindowId === window.id}/>
        {/each}
    </div>
</main>

<style>
   	main {
  		width: min(960px, calc(100% - 40px));
  		margin: 0 auto;
   	}
</style>
