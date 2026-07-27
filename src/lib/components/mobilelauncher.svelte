    <script lang="ts">
        import { onMount } from "svelte";
        import { apps, type App } from '$lib/data/appslist';
        import Icon from "@iconify/svelte"
    	import type { WebringData } from "$lib/data/webrings";
    	import Webringsfetch from "$lib/apps/webringsfetch.svelte";

        let { webringData, isWebringLoading, webringErrors }: {
           	webringData: Record<string, WebringData>,
           	isWebringLoading: boolean,
           	webringErrors: Record<string, string>
    	} = $props();
        // let activeApp = $state<App | undefined>(apps.find((app) => app.id === 'welcome'));
        let activeApp = $state<App | undefined>(undefined);
        let mobileApps: App[] = $state(apps);

        let now = $state(new Date());

    	let timer: ReturnType<typeof setInterval>;

    	onMount(() => {
            const webringFetch: App = {
                id: 'webrings',
                name: 'Webrings\nFetch',
                title: "~: webringsfetch",
                icon: '/icons/webringsfetchicon.svg',
                description: '',
                component: Webringsfetch,
                width: 0,
                height: 0
                }

            mobileApps.push(webringFetch);

        timer = setInterval(() => {
            now = new Date();
        }, 1000);

        return () => clearInterval(timer);
    	});


    </script>

    <!-- markup (zero or more items) goes here -->
    <div class="launcher-enviroment">
        <div class="panel">
            <div class="left">
                <div class="date-panel sub-panel">
                    <div class="time-line">{now.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
            </div>

            <div class="center">
                <div class="main-panel">Rame.WTF</div>
            </div>

            <div class="right">
                <Icon icon='material-symbols:signal-cellular-3-bar' color='#FFF' width=24/>
                <Icon icon='material-symbols:battery-android-5' color='#FFF' width=24/>
            </div>
        </div>
        <div class="app-list">
            {#each mobileApps as app (app.id)}
                <div class="app" onclick={() => activeApp = mobileApps.find((appa) => appa.id === app.id)}>
                    <img class="app-logo" src={app.icon}/>
                    <div class="app-name">{app.name}</div>
                </div>
            {/each}
        </div>
        {#if activeApp !== undefined}
            {@const Content = activeApp.component}
            <div class="app-window">
    	<div class="window-header">
    		<div class="window-title">{activeApp.title}</div>

    		<button
    			class="close-button"
    			aria-label="Закрыть окно"
    			onclick={() => activeApp = undefined}
    		>
       			<svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 4L12 12M12 4L4 12" />
          </svg>
    		</button>
    	</div>

    	<div class="app-content">
    		{#if activeApp.id === 'webrings'}
    			<Content
    				webringData={webringData}
    				isWebringLoading={isWebringLoading}
    				webringErrors={webringErrors}
    			/>
    		{:else}
    			<Content {...activeApp.props} />
    		{/if}
    	</div>
            </div>
        {/if}
    </div>

    <style>
    	/* styles go here */
    	.launcher-enviroment {
           	--panel-height: 48px;

           	position: fixed;
           	inset: 0;

           	width: 100%;
           	height: 100dvh;

           	overflow: hidden;
           	background: var(--color-surface);
        }

       	.app-list {
           	padding: 8px;
           	padding-top: calc(var(--panel-height) + 8px);

           	display: grid;
           	grid-template-columns: repeat(3, 1fr);
           	gap: 24px;
        }

    	.app{
            display: flex;
            flex-direction: column;
            align-items: center;
            color: var(--color-text-primary);
    	}

    	.app:active{
            animation-duration: 400;
    	    transform: scale(0.95)
    	}

    	.app-name{
            font-size: 16px;
            text-align: center;
    	}

    	.app-logo{
            height: 48px;
            width: 48px;
            padding: 8px;
            background: var(--color-window-bg);
            text-align: center;
            margin-bottom: 8px;

            border: 2px solid var(--color-border-active);
            border-radius: 8px;
    	}

    	.window-header {
           	flex: 0 0 40px;
           	box-sizing: border-box;
           	padding: 0 8px;
            border-bottom: 2px solid var(--color-border);
           	display: flex;
           	align-items: center;
           	justify-content: space-between;

           	background: var(--color-surface-hover);
           	color: var(--text);
           	user-select: none;
        }

    	.close-button {
            width: 26px;
            height: 26px;

            display: grid;
            place-items: center;

            padding: 0;
            border: 0;
            border-radius: 6px;

            background: transparent;
            color: var(--text-muted);

            cursor: pointer;
            transition:
                background 120ms ease,
                color 120ms ease;
    	}

    	.close-button svg {
            width: 16px;
            height: 16px;

            fill: none;
            stroke: currentColor;
            stroke-width: 2.2;
            stroke-linecap: round;
    	}

    	.app-window {
           	position: absolute;
           	top: var(--panel-height);
           	right: 0;
           	bottom: 0;
           	left: 0;

           	display: flex;
           	flex-direction: column;

           	overflow: hidden;
           	background: var(--color-surface);
           	color: var(--color-text);

           	z-index: 1000;
        }

    	.app-content {
    		flex: 1;
    		min-width: 0;
    		min-height: 0;

    		overflow-x: hidden;
    		overflow-y: auto;

    		overscroll-behavior: contain;

    	}

    	.panel {
           	position: absolute;
           	inset: 0 0 auto 0;

           	width: 100%;
           	height: var(--panel-height);
           	box-sizing: border-box;

           	padding: 4px 8px;

           	display: grid;
           	grid-template-columns: 1fr 1fr 1fr;
           	align-items: center;
           	gap: 8px;

           	z-index: 1001;
           	user-select: none;
        }

        .sub-panel {
            color: var(--color-text);
            font-weight: 700;
        }

        .main-panel {
            color: var(--color-text);
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .date-panel {
            display: flex;
            gap: 8px;
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
