<script lang="ts">
	import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  import { onDestroy } from 'svelte';
  import { tick } from 'svelte';

  let gameElement: HTMLDivElement;

  let { currentLocale, onResize}: { currentLocale: 'ru' | 'en', onResize?: (width: number, height: number) => void; } = $props();

  let isUserOnMobile = $state(false);

  type Cell = {
    isOpened: boolean,
    hasMine: boolean,
    isFlagged: boolean,
    nearbyMines: number,
    row: number,
    column: number,
    wrongFlag: boolean
  }

  const neighborOffsets = [
	[-1, -1], [-1, 0], [-1, 1],
	[0, -1],           [0, 1],
	[1, -1],  [1, 0],  [1, 1]
  ];

  const rowsString = currentLocale === 'ru' ? "Строки" : "Rows";
  const columnsString = currentLocale === 'ru' ? "Столбцы" : "Columns";
  const MinesString = currentLocale === 'ru' ? "Мины" : "Mines";
  const SetString = currentLocale === 'ru' ? "ПРИМЕНИТЬ" : "APPLY";

  let mineField: Cell[][] = $state([]);
  let minesCount: number = $state(0);
  let maxMines: number = $state(10);
  let rows: number = $state(8);
  let columns: number = $state(8);

  let onSettings: boolean = $state(false);

  let newMaxMines: number = $state(maxMines);
  let newRows: number = $state(rows);
  let newColumns: number = $state(columns);

  let cellsClosed: number = $state(rows*columns);
  let flagsLeft: number = $state(maxMines);
  let timer: number = $state(0);
  let timerId: ReturnType<typeof setInterval> | undefined;
  let status: 'playing' | 'won' | 'lost' | 'stale' = $state('stale');

  let settingsValid = $derived(
      newRows > 1 &&
      newColumns > 1 &&
      newColumns <= 100 &&
      newRows <= 100 &&
      newMaxMines < newRows * newColumns
  );

  function setField(rows: number, columns: number){
    for(let i = 0; i < rows; i++){
      mineField.push([]);

      for(let j = 0; j < columns; j++){
        mineField[i].push({
          isOpened: false,
          hasMine: false,
          isFlagged: false,
          nearbyMines: 0,
          row: i,
          column: j,
          wrongFlag: false
        });
      }
    }
  }

  onMount(() => {
    setField(rows, columns);
    placeMines(maxMines);

    const mediaQuery = window.matchMedia('(max-width: 900px)');
    isUserOnMobile = mediaQuery.matches;
  })

  onDestroy(() => {
	if (timerId !== undefined) {
		clearInterval(timerId);
	}
  });

  function openCell(cell: Cell) {
    if (status === 'won' || status === 'lost') {
	return;
    }

    if (cell.isOpened || cell.isFlagged) {
		return;
	}

    if(status === 'stale'){
      status = 'playing';
      timerId = setInterval(() => {timer++}, 1000);
    }

	if (cell.hasMine) {
      for (let i = 0; i < rows; i++) {
      		for (let j = 0; j < columns; j++) {
     			const currentCell = mineField[i][j];

     			if (currentCell.isFlagged && !currentCell.hasMine) {
      				currentCell.wrongFlag = true;
     			}

     			if (currentCell.hasMine && !currentCell.isFlagged) {
      				currentCell.isOpened = true;
     			}
      		}
     	}
		status = 'lost';
		clearInterval(timerId);
		return;
	}

	cell.isOpened = true;
	cellsClosed--;

	if(cellsClosed === maxMines){
      status = 'won';
      clearInterval(timerId);
      return;
	}

	if (cell.nearbyMines > 0) {
		return;
	}

	for (const [rowOffset, columnOffset] of neighborOffsets) {
		const neighborRow = cell.row + rowOffset;
		const neighborColumn = cell.column + columnOffset;

		if (
			neighborRow < 0 ||
			neighborRow >= rows ||
			neighborColumn < 0 ||
			neighborColumn >= columns
		) {
			continue;
		}

		const neighbor = mineField[neighborRow][neighborColumn];

		if (!neighbor.hasMine) {
			openCell(neighbor);
		}
	}
  }

  function toggleFlag(event: MouseEvent, cell: Cell) {
	event.preventDefault();

	if (status === 'won' || status === 'lost') {
		return;
	}

	if (cell.isOpened) {
		return;
	}

	if(status === 'stale'){
      status = 'playing';
      timerId = setInterval(() => {timer++}, 1000);
    }

    if (cell.isFlagged) {
        cell.isFlagged = false;
        flagsLeft++;
    } else if (flagsLeft > 0) {
        cell.isFlagged = true;
        flagsLeft--;
    }

  }

  function gameReset(){
    for(let i = 0; i < rows; i++){
		for(let j = 0; j < columns; j++){
		  mineField[i][j].isOpened = false;
		  mineField[i][j].isFlagged = false;
		  mineField[i][j].nearbyMines = 0;
		  mineField[i][j].hasMine = false;
		  mineField[i][j].wrongFlag = false;
		}
    }

    status = 'stale';
    minesCount = 0;
    flagsLeft = maxMines;
    clearInterval(timerId);
    timer = 0;
    cellsClosed = rows*columns;

    placeMines(maxMines);
  }

  async function applySettings() {
	const totalCells = newRows * newColumns;

	if (
		newRows < 1 ||
		newColumns < 1 ||
		newMaxMines < 1 ||
		newMaxMines >= totalCells
	) {
		return;
	}

	clearInterval(timerId);
	timerId = undefined;

	rows = newRows;
	columns = newColumns;
	maxMines = newMaxMines;

	mineField = [];
	minesCount = 0;
	cellsClosed = rows * columns;
	flagsLeft = maxMines;
	timer = 0;
	status = 'stale';

	setField(rows, columns);
	placeMines(maxMines);
	onSettings = !onSettings

	await tick();

		onResize?.(
			gameElement.offsetWidth,
			gameElement.offsetHeight
		);
  }

  function placeMines(maxMines: number){
    while(minesCount < maxMines){
      const row = Math.floor(Math.random() * rows);
      const column = Math.floor(Math.random() * columns);
      const currentMine = mineField[row][column];

      if(!currentMine.hasMine){
        currentMine.hasMine =  true;
        minesCount++;
        for (const [rowOffset, columnOffset] of neighborOffsets) {
       	const neighborRow = row + rowOffset;
       	const neighborColumn = column + columnOffset;

       	if (
        		neighborRow >= 0 &&
        		neighborRow < rows &&
        		neighborColumn >= 0 &&
        		neighborColumn < columns
       	) {
        		mineField[neighborRow][neighborColumn].nearbyMines++;
       	}
        }
      }

    }
  }


</script>

<div class="game-container">
    <div class="game" bind:this={gameElement}>
        <div class="game">
            {#if !onSettings}
                <div class="counters-container">
                   	<div class="counter flags">
                  		{flagsLeft}
                   	</div>

                   	<div class="center-controls">
                  		<button
                 			class="cell-button closed"
                 			onclick={gameReset}
                 			aria-label="Restart game"
                  		>
                 			{#if status === 'stale'}
                    				<span>😴</span>
                 			{:else if status === 'playing'}
                    				<span>😊</span>
                 			{:else if status === 'won'}
                    				<span>😎</span>
                 			{:else}
                    				<span>💀</span>
                 			{/if}
                  		</button>

                  		{#if !isUserOnMobile}
                 			<button
                    				class="cell-button closed"
                    				onclick={() => onSettings = !onSettings}
                    				aria-label="Settings"
                 			>
                    				<Icon icon="material-symbols:settings" width=24 color=#FFF/>
                 			</button>
                  		{/if}
                   	</div>

                   	<div class="counter timer">
                  		{timer}
                   	</div>
                </div>
            {:else}
            <div class="settings-container">
                <div class="settings-counters-container">
                    <div>
                        <div class="counter rows">
                            {newRows}
                        </div>
                        <div style='text-align: center;'>{rowsString}</div>
                        <div class="modifiers-container">
                            <div class="cell-button-modifier plus closed" onclick={() => {if (newRows >= 6) newRows++;}}>+</div>
                            <div class="cell-button-modifier minus closed" onclick={() => {if (newRows > 6) newRows--;}}>-</div>
                        </div>
                    </div>

                    <div>
                        <div class="counter columns">
                            {newColumns}
                        </div>
                        <div style='text-align: center;'>{columnsString}</div>
                        <div class="modifiers-container">
                            <div class="cell-button-modifier plus closed" onclick={() => {if (newColumns >= 6) newColumns++;}}>+</div>
                            <div class="cell-button-modifier minus closed" onclick={() => {if (newColumns > 6) newColumns--;}}>-</div>
                        </div>
                    </div>

                    <div>
                        <div class="counter mines">
                            {newMaxMines}
                        </div>
                        <div style='text-align: center;'>{MinesString}</div>
                        <div class="modifiers-container">
                            <div class="cell-button-modifier plus closed" onclick={() => {if (newMaxMines >= 2) newMaxMines++;}}>+</div>
                            <div class="cell-button-modifier minus closed" onclick={() => {if (newMaxMines > 2) newMaxMines--;}}>-</div>
                        </div>
                    </div>
                </div>

                <button class="cell-button-set closed" onclick={applySettings} disabled={!settingsValid}>
                    <div>{SetString}</div>
                </button>
            </div>
            {/if}



            <div class="mines-field" style:grid-template-columns={`repeat(${columns}, var(--cell-size))`} style:grid-template-rows={`repeat(${rows}, var(--cell-size))`}>
                {#each mineField as cellRow (cellRow)}
                    {#each cellRow as cell (cell)}
                        {#if cell.isOpened}
                            {#if cell.hasMine}
                                <div class="cell opened">
                                   	<svg
                                  		class="mine-icon"
                                  		xmlns="http://www.w3.org/2000/svg"
                                  		viewBox="0 0 24 24"
                                  		aria-hidden="true"
                                        fill='#FFF'
                                   	>
                                  		<path
                                 			d="M23 13v-2h-3.07a8 8 0 0 0-1.62-3.9l2.19-2.17l-1.43-1.43l-2.17 2.19A8 8 0 0 0 13 4.07V1h-2v3.07c-1.42.18-2.77.74-3.9 1.62L4.93 3.5L3.5 4.93L5.69 7.1A8 8 0 0 0 4.07 11H1v2h3.07c.18 1.42.74 2.77 1.62 3.9L3.5 19.07l1.43 1.43l2.17-2.19c1.13.88 2.48 1.44 3.9 1.62V23h2v-3.07c1.42-.18 2.77-.74 3.9-1.62l2.17 2.19l1.43-1.43l-2.19-2.17a8 8 0 0 0 1.62-3.9zM12 8a4 4 0 0 0-4 4H6a6 6 0 0 1 6-6z"
                                  		/>
                                   	</svg>
                                </div>
                            {:else}
                            <div class="cell opened">
                                {#if cell.nearbyMines !== 0}
                                    <div>{cell.nearbyMines}</div>
                                {/if}
                            </div>
                            {/if}
                            {:else}
                            {#if cell.wrongFlag}
                               	<div class="cell closed" onclick={() => openCell(cell)} oncontextmenu={(event) => toggleFlag(event, cell)}>🏴‍☠️</div>
                            {:else if cell.isFlagged}
                               	<div class="cell closed" onclick={() => openCell(cell)} oncontextmenu={(event) => toggleFlag(event, cell)}>🚩</div>
                                {:else}
                               	<div class="cell closed" onclick={() => openCell(cell)} oncontextmenu={(event) => toggleFlag(event, cell)}></div>
                                {/if}
                            {/if}
                    {/each}
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .game-container{
        display: flex;
        flex-direction: column;
	    align-items: center;
        padding: 8px;
        user-select: none;

        --cell-size: min(36px, calc((100vw - 56px) / 8));
    }

    .game{
        width: max-content;
    }

    .counters-container {
    	display: grid;
    	grid-template-columns: 1fr auto 1fr;
    	align-items: center;

    	width: 100%;
    	box-sizing: border-box;

    	margin-bottom: 8px;
    	padding: 8px;
    	gap: 8px;

    	border-right: 4px solid var(--color-surface-hover);
    	border-bottom: 4px solid var(--color-surface-hover);
    	border-left: 4px solid var(--color-window-bg);
    	border-top: 4px solid var(--color-window-bg);
    }

    .flags {
        justify-self: start;
    }

    .timer {
        justify-self: end;
    }

    .center-controls {
    	display: flex;
    	align-items: center;
    	justify-content: center;
    	gap: 8px;
        font-size: 24px;
    }

    .settings-container{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-items: center;
        margin-bottom: 8px;
        padding: 8px;
        border-right: 4px solid var(--color-surface-hover);
        border-bottom: 4px solid var(--color-surface-hover);
        border-left: 4px solid var(--color-window-bg);
        border-top: 4px solid var(--color-window-bg);
    }

    .settings-counters-container{
        display: grid;
        align-items: center;
        justify-items: center;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
        margin-bottom: 8px;
        padding: 8px;
    }

    .counter{
        padding: 8px;
        font-size: 25px;
        font-weight: 600;
        width: 60px;
        height: 60px;
        text-align: center;

        border-right: 4px solid var(--color-surface-hover);
        border-bottom: 4px solid var(--color-surface-hover);
        border-left: 4px solid var(--color-window-bg);
        border-top: 4px solid var(--color-window-bg);
    }

    .modifiers-container{
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    .mines-field{
        display: grid;
        border-right: 4px solid var(--color-surface-hover);
        border-bottom: 4px solid var(--color-surface-hover);
        border-left: 4px solid var(--color-window-bg);
        border-top: 4px solid var(--color-window-bg);
    }

    .cell{
        width: var(--cell-size);
        height: var(--cell-size);
    }

    .opened{
        background: var(--color-surface-active);
        text-align: center;
        border: 2px solid var(--color-window-bg);
    }

    .closed{
        background: var(--color-surface);
        text-align: center;
        border-bottom: 4px solid var(--color-window-bg);
        border-right: 4px solid var(--color-window-bg);
        border-left: 4px solid var(--color-surface-hover);
        border-top: 4px solid var(--color-surface-hover);
    }

    .cell-button{
        width: 48px;
        height: 48px;
    }

    .cell-button-set{
        width: 120px;
        height: 50px;
        text-align: center;
        place-items: center;
        box-sizing: border-box;
        padding: 8px;
        font-weight: 800;
        color: var(--color-text-primary);
    }

    .cell-button-set:active{
        background: var(--color-surface-active);
        border: 2px solid var(--color-window-bg);
    }

    .cell-button-set:disabled{
        color: var(--color-text-muted);
    }

    .cell-button-modifier{
        width: 32px;
        height: 32px;
        font-weight: 800;
    }

    .cell-button:active{
        background: var(--color-surface-active);
        border: 2px solid var(--color-window-bg);
    }

    .cell,
    .cell-button,
    .counter {
	box-sizing: border-box;
	display: grid;
	place-items: center;
    }

    @media (max-width: 900px) {
    .game-container {
    	--cell-size: min(
    		36px,
    		calc((100vw - 56px) / 8)
    	);
	}
	.counters-container {
		padding: 6px;
		gap: 8px;
	}

	.counter {
		width: 52px;
		height: 52px;
		font-size: 22px;
	}

	.cell-button {
		width: 44px;
		height: 44px;
	}
    }

</style>
