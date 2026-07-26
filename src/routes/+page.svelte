<script lang="ts">
	import Webrings from "$lib/components/webrings.svelte";

    import { onMount } from 'svelte';
    import type { Component } from 'svelte';

    import { fade } from 'svelte/transition';

    import BootScreen from '$lib/components/bootscreen.svelte';
    import Applauncher from '$lib/components/applauncher.svelte';
    import Window from '$lib/components/window.svelte';
    import Panel from '$lib/components/panel.svelte';

    import type { App } from '$lib/data/appslist';
    import { apps } from '$lib/data/appslist';
	import type { WebringData } from "$lib/data/webrings";
	import { webrings } from "$lib/data/webrings";
	import { fetchWebringSite } from "$lib/data/webrings";

	let webringSites = $state<Record<string, WebringData>>({});
	let webringErrors = $state<Record<string, string>>({});
	let isWebringLoading = $state(true);

	onMount(async () => {
		const results = await Promise.all(
			webrings.map(async (webring) => {
				try {
					const [next, prev] = await Promise.all([
						fetchWebringSite(
							`${webring.apiBaseUrl}/${webring.slug}/next/data`, 'next'
						),
						fetchWebringSite(
							`${webring.apiBaseUrl}/${webring.slug}/prev/data`, 'previous'
						)
					]);

					return {
						id: webring.id,
						data: { next, prev },
						error: null
					};
				} catch (error) {
					return {
						id: webring.id,
						data: null,
						error:
							error instanceof Error
								? error.message
								: 'Unknown error'
					};
				}
			})
		);

		for (const result of results) {
			if (result.data) {
				webringSites[result.id] = result.data;
			}

			if (result.error) {
				webringErrors[result.id] = result.error;
			}
		}

		isWebringLoading = false;
	});

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

    const PANEL_HEIGHT = 40;
    const VIEWPORT_PADDING = 16;
    const WINDOW_OFFSET = 30;

    let isBooting = $state(false);
    let isInitialized = $state(false);
    let isLauncherVisible = $state(false);
    let areWebringsVisible = $state(false);
    let isUserOnMobile = $state(false);

    let windows = $state<WindowData[]>([]);

    let focusedWindowId = $state<number | null>(null);
    let nextZIndex = $state(1);
    let nextWindowId = $state(1);

    const ramefetchApp = apps.find((app) => app.id === 'ramefetch');
    const welcomeApp = apps.find((app) => app.id === 'welcome');

    if (!ramefetchApp || !welcomeApp) {
        throw new Error('Initial applications are missing');
    }

    function calculateWindowSize(app: App) {
        const availableWidth =
            window.innerWidth - VIEWPORT_PADDING * 2;

        const availableHeight =
            window.innerHeight - PANEL_HEIGHT - VIEWPORT_PADDING * 2;

        return {
            width: Math.min(app.width, availableWidth),
            height: Math.min(app.height, availableHeight)
        };
    }

    function calculateWindowPosition(
        width: number,
        height: number,
        offset = 0
    ) {
        const centeredX = (window.innerWidth - width) / 2;
        const centeredY =
            PANEL_HEIGHT +
            (window.innerHeight - PANEL_HEIGHT - height) / 2;

        const maxX = Math.max(
            VIEWPORT_PADDING,
            window.innerWidth - width - VIEWPORT_PADDING
        );

        const maxY = Math.max(
            PANEL_HEIGHT + VIEWPORT_PADDING,
            window.innerHeight - height - VIEWPORT_PADDING
        );

        return {
            x: Math.min(
                maxX,
                Math.max(VIEWPORT_PADDING, centeredX + offset)
            ),
            y: Math.min(
                maxY,
                Math.max(
                    PANEL_HEIGHT + VIEWPORT_PADDING,
                    centeredY + offset
                )
            )
        };
    }

    function createWindow(
        app: App,
        options: {
            offset?: number;
        } = {}
    ): WindowData {
        const id = nextWindowId++;
        const zIndex = ++nextZIndex;

        const { width, height } = calculateWindowSize(app);
        const { x, y } = calculateWindowPosition(
            width,
            height,
            options.offset ?? 0
        );

        return {
            id,
            appId: app.id,
            title: app.title,
            width,
            height,
            x,
            y,
            zIndex,
            windowContent: app.component,
            contentProps: app.props
        };
    }

    onMount(() => {
        const mediaQuery = window.matchMedia('(max-width: 900px)');

        function updateMobileState() {
            isUserOnMobile = mediaQuery.matches;
        }

        updateMobileState();
        mediaQuery.addEventListener('change', updateMobileState);

        const hasBooted = sessionStorage.getItem('booted') === 'true';

        const ramefetchWindow = createWindow(ramefetchApp, {
            offset: 400
        });

        const welcomeWindow = createWindow(welcomeApp, {
            offset: -400
        });

        windows = [ramefetchWindow, welcomeWindow];
        focusedWindowId = welcomeWindow.id;

        isBooting = !hasBooted;
        isInitialized = true;

        return () => {
            mediaQuery.removeEventListener('change', updateMobileState);
        };
    });

    function onBootComplete() {
        if(!isUserOnMobile){
          isBooting = false;
          sessionStorage.setItem('booted', 'true');
        }
    }

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

        const targetWindow = windows.find(
            (window) => window.id === id
        );

        if (!targetWindow) {
            return;
        }

        targetWindow.zIndex = ++nextZIndex;
        focusedWindowId = id;
    }

    function onLauncherClick() {
        isLauncherVisible = !isLauncherVisible;
    }

    function onOpen(app: App) {
        const offset = windows.length * WINDOW_OFFSET;

        const newWindow = createWindow(app, {
            offset
        });

        windows = [...windows, newWindow];
        focusedWindowId = newWindow.id;
        isLauncherVisible = false;
    }
</script>

<svelte:head>
	<title>Rame.wtf</title>

	<meta
		name="description"
		content="Персональный desktop-сайт разработчика Rame: проекты, эксперименты, ссылки и интерактивные приложения."
	/>

	<meta property="og:title" content="Rame.WTF" />
	<meta
		property="og:description"
		content="Персональный desktop-сайт разработчика Rame: проекты, эксперименты, ссылки и интерактивные приложения."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://rame.wtf" />

	<meta name="theme-color" content="#2b1418" />

	<link rel="canonical" href="https://rame.wtf/" />
	<meta property="og:image" content="https://rame.wtf/og-image.png" />
	<meta property="og:locale" content="ru_RU" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Rame.wtf" />
	<meta name="twitter:description" content="Персональный desktop-сайт разработчика Rame: проекты, эксперименты, ссылки и интерактивные приложения." />
	<!-- <meta name="twitter:image" content="..." /> -->
</svelte:head>

{#if isInitialized}
    {#if isBooting}
        <BootScreen onComplete={onBootComplete} isUserOnMobile={isUserOnMobile}/>
    {:else}
        <main transition:fade>
            <Panel
                main_panel_title={windows.find(
                    (window) => window.id === focusedWindowId
                )?.title}
                onLauncherClick={() => isLauncherVisible = !isLauncherVisible}
                onWebringsClick={() => areWebringsVisible = !areWebringsVisible}
            />

            <Applauncher
                onOpen={onOpen}
                isVisible={isLauncherVisible}
                onOuterLauncherClick={onLauncherClick}
            />

            <Webrings
                isVisible={areWebringsVisible}
                onOuterwebringsClick={() => areWebringsVisible = !areWebringsVisible}
                webringData={webringSites}
                isWebringLoading={isWebringLoading}
                webringErrors={webringErrors}
            />

            <div class="window-environment">
                {#each windows as window (window.id)}
                    <Window
                        windowParameters={window}
                        onClose={() => onClose(window.id)}
                        onFocus={() => onFocus(window.id)}
                        isFocused={focusedWindowId === window.id}
                    />
                {/each}
            </div>
        </main>
    {/if}
{/if}

<style>
   	main {
  		width: min(960px, calc(100% - 40px));
  		margin: 0 auto;
        overflow: hidden;
   	}
</style>
