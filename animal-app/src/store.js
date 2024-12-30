import { writable } from 'svelte/store';

export const lastName = writable('');
export const lastAnimal = writable('');

export const count = writable(0);