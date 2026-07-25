<script lang="ts">

  import type { Component } from 'svelte';

  let { windowParameters, onClose, onFocus, isFocused}: { windowParameters: WindowParameters,  onClose: () => void, onFocus: () => void, isFocused: boolean} = $props();

  export type WindowParameters = {
      id: number;
      appId?: string;

      width: number;
      height: number;
      x: number;
      y: number;

      title: string;
      zIndex: number;

      windowContent?: Component<any>;
      contentProps?: Record<string, unknown>;
  };

  const resizeSides = [
      'right',
      'left',
      'top',
      'bottom',
      'topleft',
      'topright',
      'bottomleft',
      'bottomright'
  ]

  let isDragging: boolean = $state(false);
  let isResizing: boolean = $state(false);

  let offsetX: number = $state(0);
  let offsetY: number = $state(0);

  let resizeStartX: number = $state(0);
  let resizeStartY: number = $state(0);
  let resizeStartWidth: number = $state(0);
  let resizeStartHeight: number = $state(0);
  let resizeStartWindowX = $state(0);
  let resizeStartWindowY = $state(0);
  let resizeSide: string = $state('');

  function handleDraggingStart(event: PointerEvent){
    if(!isFocused){
      onFocus();
    }
    const target = event.target as HTMLElement;

    if (target.closest('button')) {
		return;
	}

    isDragging = true;
    offsetX = event.clientX - windowParameters.x;
    offsetY = event.clientY - windowParameters.y;

    const header = event.currentTarget as HTMLElement;
    header.setPointerCapture(event.pointerId);
  }

  function handleResizeStart(event: PointerEvent){
    if(!isFocused){
      onFocus();
    }
    const target = event.target as HTMLElement;

    if (target.closest('button')) {
		return;
	}

    isResizing = true;
    resizeStartX = event.clientX
    resizeStartY = event.clientY
    resizeStartWidth = windowParameters.width;
    resizeStartHeight = windowParameters.height;
    resizeStartWindowX = windowParameters.x;
    resizeStartWindowY = windowParameters.y;

    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    resizeSide = handle.className.toString().split(' ')[1].split('-')[2];
  }

  function handleResizing(event: PointerEvent){
    if(!isResizing){
      return;
    }

    const deltaX = event.clientX - resizeStartX;
    const deltaY = event.clientY - resizeStartY;

    const maxDeltaX = resizeStartWidth - 300;
    const limitedDeltaX = Math.min(deltaX, maxDeltaX);

    const maxDeltaY = resizeStartHeight - 300;
    const limitedDeltaY = Math.min(deltaY, maxDeltaY);

    switch(resizeSide){
      case 'right':
        windowParameters.width = Math.max(
            300,
            resizeStartWidth + deltaX
        );
        break;
      case 'left':
        windowParameters.width = resizeStartWidth - limitedDeltaX;
        windowParameters.x = resizeStartWindowX + limitedDeltaX;
        break;
      case 'bottom':
        windowParameters.height = Math.max(
            300,
            resizeStartHeight + deltaY
        );
        break;
      case 'top':
        windowParameters.height = resizeStartHeight - limitedDeltaY;
        windowParameters.y = resizeStartWindowY + limitedDeltaY;
        break;
      case 'bottomright':
        windowParameters.width = Math.max(
            300,
            resizeStartWidth + deltaX
        );
        windowParameters.height = Math.max(
            300,
            resizeStartHeight + deltaY
        );
        break;
      case 'bottomleft':
        windowParameters.width = resizeStartWidth - limitedDeltaX;
        windowParameters.x = resizeStartWindowX + limitedDeltaX;
        windowParameters.height = Math.max(
            300,
            resizeStartHeight + deltaY
        );
        break;
      case 'topleft':
        windowParameters.width = resizeStartWidth - limitedDeltaX;
        windowParameters.x = resizeStartWindowX + limitedDeltaX;
        windowParameters.height = resizeStartHeight - limitedDeltaY;
        windowParameters.y = resizeStartWindowY + limitedDeltaY;
        break;
      case 'topright':
      windowParameters.width = Math.max(
          300,
          resizeStartWidth + deltaX
      );
      windowParameters.height = resizeStartHeight - limitedDeltaY;
      windowParameters.y = resizeStartWindowY + limitedDeltaY;
        break;
    }


  }

  function handleDragging(event: PointerEvent){
    if(isDragging){
      windowParameters.x = Math.min(
          window.innerWidth - windowParameters.width - 1,
          Math.max(0, event.clientX - offsetX)
      );

      windowParameters.y = Math.min(
          window.innerHeight - windowParameters.height - 1,
          Math.max(40, event.clientY - offsetY)
      );
    }
  }

  let handleResizeEnd = (event: PointerEvent) => {isResizing = false; const header = event.currentTarget as HTMLElement; header.releasePointerCapture(event.pointerId);}

  let handleDraggingEnd = (event: PointerEvent) => {isDragging = false; const header = event.currentTarget as HTMLElement; header.releasePointerCapture(event.pointerId);}

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="window" class:focused={isFocused}
	style:width={`${windowParameters.width}px`}
	style:height={`${windowParameters.height}px`}
	style:left={`${windowParameters.x}px`}
	style:top={`${windowParameters.y}px`}
	style:z-index={windowParameters.zIndex}
	onpointerdown={onFocus}
>
    {#each resizeSides as side (side)}
        <div
       	class="resize-handle resize-handle-{side}"
       	onpointerdown={handleResizeStart}
       	onpointermove={handleResizing}
       	onpointerup={handleResizeEnd}
        onpointercancel={handleResizeEnd}
        onlostpointercapture={handleResizeEnd}
        ></div>
    {/each}

    <div class="window-header"
        onpointerdown={handleDraggingStart}
        onpointerup={handleDraggingEnd}
        onpointermove={handleDragging}
        onpointercancel={handleDraggingEnd}
        onlostpointercapture={handleDraggingEnd}
        style:cursor={isDragging ? 'move' : ''}
        >
        <div class="window-title">{windowParameters.title}</div>
        <button class="close-button" aria-label="Закрыть окно" onclick={onClose}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 4L12 12M12 4L4 12" />
            </svg>
        </button>
    </div>

    <div class="window-content">
        {#if windowParameters.windowContent}
            {@const Content = windowParameters.windowContent}
            <Content {...windowParameters.contentProps}/>
        {/if}
    </div>
</div>


<style>
	/* styles go here */
	.window {
		position: absolute;
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
        color: var(--color-text);

        border: 1px solid var(--color-border);
        border-radius: 10px;

        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
	}

	.window.focused {
        box-shadow:
            0 0 0 1px var(--color-accent-muted),
            0 12px 36px rgba(0, 0, 0, 0.65);
	}

	.window-content {
    	flex: 1;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
	}

	.resize-handle {
		position: absolute;
		z-index: 10;
	}

	.resize-handle-right {
		top: 0;
		right: -4px;
		width: 8px;
		height: 100%;
		cursor: ew-resize;
		touch-action: none;
	}

	.resize-handle-left{
		top: 0;
		left: -4px;
		width: 8px;
		height: 100%;
		cursor: ew-resize;
		touch-action: none;
	}

	.resize-handle-bottom{
		bottom: -4px;
		right: 0px;
		height: 8px;
		width: 100%;
		cursor: ns-resize;
		touch-action: none;
	}

	.resize-handle-top{
		top: -4px;
		right: 0px;
		height: 8px;
		width: 100%;
		cursor: ns-resize;
		touch-action: none;
	}

	.resize-handle-bottomright{
		bottom: -4px;
		right: -4px;
		height: 8px;
		width: 8px;
		cursor: nw-resize;
		touch-action: none;
	}

	.resize-handle-topright{
		top: -4px;
		right: -4px;
		height: 8px;
		width: 8px;
		cursor: ne-resize;
		touch-action: none;
	}

	.resize-handle-topleft{
		top: -4px;
		left: -4px;
		height: 8px;
		width: 8px;
		cursor: se-resize;
		touch-action: none;
	}

	.resize-handle-bottomleft{
		bottom: -4px;
		left: -4px;
		height: 8px;
		width: 8px;
		cursor: sw-resize;
		touch-action: none;
	}

	.window-header {
    	height: 30px;
        padding: 0 4px 0 10px;

        display: flex;
        align-items: center;
        justify-content: space-between;

        background: var(--surface);
        color: var(--text);

        border-bottom: 1px solid var(--border);
	}


	.content-placeholder{
	    background-color: #FFFFFF;
		width: 100%;
		height: 100%;
	}

	.content-placeholder p {
		margin: 0;
		color: #000;
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

	.close-button:hover {
        background: var(--accent);
        color: #fff;
	}

	.close-button:active {
        background: #c91d32;
	}

	.close-button svg {
        width: 16px;
        height: 16px;

        fill: none;
        stroke: currentColor;
        stroke-width: 2.2;
        stroke-linecap: round;
	}
</style>
