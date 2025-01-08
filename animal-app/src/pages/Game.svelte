<script>
  import { onMount } from 'svelte';
  import DrawCardButton from '../components/DrawCardButton.svelte';
  import { gameStore } from '../store';
  import OpenAI from "openai";
  import DrawTwoCard from '../components/DrawTwoCard.svelte';
  import SkipCard from '../components/SkipCard.svelte';
  import ColorChoiceCard from '../components/ColorChoiceCard.svelte';

  const config = {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  };

  const openai = new OpenAI(config);

  let playerCards;
  let aiCards;
  let deck;
  let discardPile;
  let aiResponse;
  let lastCard;
  let canDraw;
  let message;
  let gameOver;
  let hoveredCard;
  let tooltipText;
  let chosenColor = '';
  let colorChoiceMenuOpen = false;
  const colors = ['rot', 'gelb', 'grün', 'blau'];
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const specialCards = ['Zieh 2', 'Aussetzen', 'Farbwahl'];

  $: $gameStore, updateStore();

  function updateStore() {
    ({
      playerCards,
      aiCards,
      deck,
      discardPile,
      aiResponse,
      lastCard,
      canDraw,
      message,
      gameOver,
      hoveredCard
    } = $gameStore);
  }

  function aiPlayTurn() {
    if (!canDraw) {
      canDraw = true;
      message = "Du darfst keine Karte ablegen.";
      gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
      return;
    }

    const playableCards = aiCards.filter(card =>
      card.color === lastCard.color ||
      card.number === lastCard.number ||
      (specialCards.includes(card.type) && card.type === lastCard.type)||
      (card.type === 'Zieh 2' && (card.color === lastCard.color || lastCard.type === 'Zieh 2'))
    );

    if (playableCards.length > 0) {
      const aiCard = playableCards[Math.floor(Math.random() * playableCards.length)];
      aiCards = aiCards.filter(card => card !== aiCard);
      discardPile.push(aiCard);
      lastCard = aiCard;
      canDraw = true;
      message = "";
      if (aiCard.type === 'Zieh 2') {
        drawCardForPlayer(2);
      } else if (aiCard.type === 'Aussetzen') {
        canDraw = false;
      } else if (aiCard.type === 'Farbwahl') {
        const randomColorCard = aiCards[Math.floor(Math.random() * aiCards.length)];
        chosenColor = randomColorCard.color;
        lastCard.color = chosenColor;
        gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
      }
      console.log("AI played:", aiCard);
      gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
    } else {
      drawCardForAI(1);
      aiPlayTurn(); // AI should try to play again after drawing a card
    }
    checkGameOver();
  }

  async function generateTooltipText(card) {
    try {
      const prompt = `Gib mir einen kurzen Satz über die Nummer ${card.number}.`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });
      tooltipText = response.choices[0].message.content;
    } catch (error) {
      console.error("Error generating tooltip text:", error);
      tooltipText = "Error generating tooltip text.";
    }
  }

  function createDeck() {
    const newDeck = [];
    for (const color of colors) {
      for (const number of numbers) {
        newDeck.push({ color, number });
      }
    }
    for (const special of specialCards) {
      if (special === 'Aussetzen' || special === 'Zieh 2') {
        for (const color of colors) {
          newDeck.push({ type: special, color });
        }
      } else {
        for (let i = 0; i < 4; i++) {
          newDeck.push({ type: special });
        }
      }
    }
    return newDeck;
  }

  function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function dealCards() {
    deck = shuffleDeck(createDeck());
    playerCards = deck.slice(0, 7);
    aiCards = deck.slice(7, 14);
    discardPile = [deck[14]];
    lastCard = discardPile[0];
    canDraw = true;
    gameOver = false;
    message = "";
    gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
  }

  function drawCard() {
    if (canDraw && deck.length > 0) {
      const drawnCard = deck.pop();
      playerCards = [...playerCards, drawnCard];
      canDraw = false;
      message = "Du kannst nur einmal pro Runde ziehen.";
      gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
    } else if (deck.length === 0) {
      deck = shuffleDeck(discardPile.slice(0, -1));
      discardPile = [discardPile[discardPile.length - 1]];
      const drawnCard = deck.pop();
      playerCards = [...playerCards, drawnCard];
      canDraw = false;
      message = "Du kannst nur einmal pro Runde ziehen.";
      gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
    } else {
      message = "Du kannst nur einmal pro Runde ziehen.";
      gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
    }
    checkGameOver();
  }

  function drawCardForAI(count) {
    for (let i = 0; i < count; i++) {
      if (deck.length > 0) {
        const drawnCard = deck.pop();
        aiCards = [...aiCards, drawnCard];
        console.log("AI drew a card:", drawnCard);
        canDraw = true;
        gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
      } else {
        deck = shuffleDeck(discardPile.slice(0, -1));
        discardPile = [discardPile[discardPile.length - 1]];
        const drawnCard = deck.pop();
        aiCards = [...aiCards, drawnCard];
        console.log("AI drew a card from the reshuffled discard pile:", drawnCard);
        canDraw = true;
        gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
      }
      checkGameOver();
    }
  }

  function drawCardForPlayer(count) {
    for (let i = 0; i < count; i++) {
      if (deck.length > 0) {
        const drawnCard = deck.pop();
        playerCards = [...playerCards, drawnCard];
      } else {
        deck = shuffleDeck(discardPile.slice(0, -1));
        discardPile = [discardPile[discardPile.length - 1]];
        const drawnCard = deck.pop();
        playerCards = [...playerCards, drawnCard];
      }
    }
    canDraw = false;
    message = `Du musst ${count} Karten ziehen.`;
    gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
  }

  function playCard(card) {
    if (card.type === 'Farbwahl') {
      discardPile.push(card);
      lastCard = card;
      colorChoiceMenuOpen = true;
      gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
      removeCard(card);
      return;
    }

    if (
      (card.color !== lastCard.color && card.number !== lastCard.number) ||
      (card.type === 'Aussetzen' && lastCard.type !== 'Aussetzen' && card.color !== lastCard.color) ||
      (card.type === 'Zieh 2' && lastCard.type !== 'Zieh 2' && card.color !== lastCard.color)
    ) {
      message = "Du kannst diese Karte nicht ablegen.";
      gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
      return;
    }

    playerCards = playerCards.filter(c => c !== card);
    discardPile.push(card);
    lastCard = card;
    canDraw = true;
    message = "";
    if (card.type === 'Zieh 2') {
      drawCardForAI(2);
    } else if (card.type === 'Aussetzen') {
      canDraw = false;
      message = "Der Gegner darf keine Karte ablegen.";
      aiPlayTurn(); // AI should play immediately after the skip card
    }
    gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
    checkGameOver();
  }

  function handleColorChoice(color) {
    chosenColor = color;
    lastCard.color = chosenColor;
    colorChoiceMenuOpen = false;
    gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
  }

  function checkGameOver() {
    if (playerCards.length === 0) {
      message = "Du hast gewonnen!";
      gameOver = true;
      gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
    } else if (aiCards.length === 0) {
      message = "Die KI hat gewonnen!";
      gameOver = true;
      gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
    }
  }

  function restartGame() {
    dealCards();
  }

  function removeCard(card) {
    playerCards = playerCards.filter(c => c !== card);
    discardPile.push(card);
    lastCard = card;
    canDraw = true;
    message = "";
    gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
    checkGameOver();
  }

  onMount(() => {
    dealCards();
  });
</script>

<main>
  <div>
    <h2>KI Karten:</h2>
    <ul>
      {#each aiCards as card}
        <li
          class={`card ${card.type ? 'special ' + card.type.toLowerCase().replace(' ', '-') : ''}`}
          style="background-color: {card.color};"
          on:mouseover={() => hoveredCard = card}
          on:mouseout={() => hoveredCard = null}
        >
          {#if card.type}
            {card.type}
          {:else}
            {card.number}
          {/if}
        </li>
      {/each}
    </ul>
  </div>
  <div>
    <button on:click={aiPlayTurn} disabled={gameOver}>KI Spielzug</button>
  </div>
  <div>
    <h2>KI Antwort:</h2>
    <p>{aiResponse}</p>
  </div>
  <div class="discard-draw-container">
    <div>
      <h2>Ablagestapel:</h2>
      <ul>
        {#if lastCard}
          <li
            class={`card ${lastCard.type ? 'special ' + lastCard.type.toLowerCase().replace(' ', '-') : ''}`}
            style="background-color: {lastCard.color};"
            on:mouseover={() => { hoveredCard = lastCard; generateTooltipText(lastCard); }}
            on:mouseout={() => hoveredCard = null}
          >
            {#if lastCard.type}
              {lastCard.type}
            {:else}
              {lastCard.number}
          {/if}
          </li>
        {/if}
      </ul>
    </div>
    <div>
      <h2>Karte ziehen:</h2>
      <DrawCardButton onDraw={drawCard} />
    </div>
  </div>
  <div>
    <h2>Deine Karten:</h2>
    <ul>
      {#each playerCards as card}
        <li
          class={`card ${card.type ? 'special ' + card.type.toLowerCase().replace(' ', '-') : ''}`}
          style="background-color: {card.color};"
          on:mouseover={() => { hoveredCard = card; generateTooltipText(card); }}
          on:mouseout={() => hoveredCard = null}
          on:click={() => playCard(card)}
        >
          {#if card.type}
            {card.type}
          {:else}
            {card.number}
          {/if}
        </li>
      {/each}
    </ul>
  </div>
  {#if colorChoiceMenuOpen}
  <ColorChoiceCard onPlay={() => {}} onColorChoice={handleColorChoice} />
{/if}
  <div>
    <h2>Nachricht:</h2>
    <p>{message}</p>
  </div>
  {#if gameOver}
    <div>
      <button on:click={restartGame}>Neues Spiel starten</button>
    </div>
  {/if}
  {#if hoveredCard}
    <div class="tooltip">
      {#if hoveredCard.type}
        <p>Typ: {hoveredCard.type}</p>
      {:else}
        <p>Farbe: {hoveredCard.color}</p>
        <p>Zahl: {hoveredCard.number}</p>
      {/if}
      <p>{tooltipText}</p>
    </div>
  {/if}
</main>