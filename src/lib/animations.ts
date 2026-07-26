import { backOut } from 'svelte/easing';

export const dropDownTransition = {
	y: -20,
	duration: 200,
	easing: backOut
};

export const windowTransition = {
	scale: 0.98,
	duration: 180
};
