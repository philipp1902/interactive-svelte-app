import { writable } from 'svelte/store';

// export const lastName = writable('');
// export const lastAnimal = writable('');

// export const count = writable(0);

export const gameStore = writable({
    playerCards: [],
    aiCards: [],
    deck: [],
    discardPile: [],
    lastCard: null,
    canDraw: true,
    message: "",
    gameOver: false,
    aiResponse: "",
    hoveredCard: null
  });
