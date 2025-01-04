<script>
  import { onMount } from 'svelte';
  import OpenAI from "openai";

  const config = {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  };

  const openai = new OpenAI(config);

  let playerCards = [];
  let aiCards = [];
  let deck = [];
  let discardPile = [];
  let aiResponse = "";
  let lastCard = null;
  let canDraw = true;
  let message = "";
  let gameOver = false;
  let hoveredCard = null;

  const colors = ['rot', 'gelb', 'grün', 'blau'];
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  async function runPrompt() {
    try {
      const prompt = `
You are playing a card game similar to Uno, but with some differences. Here are the rules:

1. The goal of the game is to be the first player to get rid of all your cards.
2. Each player starts with 7 cards.
3. The deck consists of cards with numbers from 1 to 10 in four colors: red, yellow, green, and blue.
4. Players take turns playing cards from their hand that match the top card of the discard pile in either color or number.
5. If a player cannot play a card, they must draw a card from the draw pile.
6. The game continues until one player has no cards left.

Your task is to play the game according to these rules. You will be given the top card of the discard pile and your hand of cards. You need to decide which card to play or if you need to draw a card.

For example, if the top card of the discard pile is a red 5, you can play any red card or any 5 from your hand. If you don't have a matching card, you need to draw a card.

Here is the current state of the game:
- Top card of the discard pile: ${lastCard.color} ${lastCard.number}
- Your hand: ${aiCards.map(card => `${card.color} ${card.number}`).join(', ')}

Which card will you play? If you need to draw a card, just say "draw".
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      aiResponse = response.choices[0].message.content;
      console.log("AI Response:", aiResponse);

      if (aiResponse.toLowerCase().includes("draw")) {
        drawCardForAI();
      } else {
        const aiCard = aiCards.find(card => aiResponse.includes(`${card.color} ${card.number}`));     // hier werden die Karten der KI mit den Karten verglichen, die sie spielen kann
        if (aiCard && (aiCard.color === lastCard.color || aiCard.number === lastCard.number)) {       // wenn die Karte der KI passt, wird sie gespielt
          aiCards = aiCards.filter(card => card !== aiCard);                                // die Karte wird aus der Hand der KI entfernt
          discardPile.push(aiCard);                                                // die Karte wird auf den Ablagestapel gelegt
          lastCard = aiCard;                                            // die Karte wird zur letzten Karte
          canDraw = true;       
          message = "";
          console.log("AI played:", aiCard);
        } else {
          console.log("AI tried to play an invalid card, drawing instead.");        // wenn die Karte nicht passt, wird eine Karte gezogen
          drawCardForAI();
        }
      }
      checkGameOver();
    } catch (error) {
      console.error(
        "Error while retrieving the parental animals, Wikipedia link, or generating the image:",
        error,
      );
    }
  }

  function createDeck() {
    const newDeck = [];
    for (const color of colors) {
      for (const number of numbers) {
        newDeck.push({ color, number });
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
    discardPile = [deck[14]]; // erste karte im ablagestapel zum start
    lastCard = discardPile[0];
    canDraw = true;
    gameOver = false;
    message = "";
  }

  function drawCard() {
    if (canDraw && deck.length > 0) {
      const drawnCard = deck.pop();
      playerCards = [...playerCards, drawnCard];
      canDraw = false;
      message = "Du kannst nur einmal pro Runde ziehen.";
    } else if (deck.length === 0) {
      deck = shuffleDeck(discardPile.slice(0, -1));
      discardPile = [discardPile[discardPile.length - 1]];
      const drawnCard = deck.pop();
      playerCards = [...playerCards, drawnCard];
      canDraw = false; // Nur einmal ziehen erlaubt
      message = "Du kannst nur einmal pro Runde ziehen.";
    } else {
      message = "Du kannst nur einmal pro Runde ziehen.";
    }
    checkGameOver();
  }

  function drawCardForAI() {
    if (deck.length > 0) {
      const drawnCard = deck.pop();
      aiCards = [...aiCards, drawnCard];
      console.log("AI drew a card:", drawnCard);
    } else {
      // wenn stapel leer, ablagestapel mischen und als neuen stapel verwenden
      deck = shuffleDeck(discardPile.slice(0, -1));
      discardPile = [discardPile[discardPile.length - 1]];
      const drawnCard = deck.pop();
      aiCards = [...aiCards, drawnCard];
      console.log("AI drew a card from the reshuffled discard pile:", drawnCard);
    }
    checkGameOver();
  }

  function playCard(card) {
    if (card.color === lastCard.color || card.number === lastCard.number) {
      playerCards = playerCards.filter(c => c !== card);
      discardPile.push(card);
      lastCard = card;
      canDraw = true;
      message = "";
    } else {
      message = "Du kannst diese Karte nicht spielen.";
    }
    checkGameOver();
  }

  function checkGameOver() {
    if (playerCards.length === 0) {
      message = "Du hast gewonnen!";
      gameOver = true;
    } else if (aiCards.length === 0) {
      message = "Die KI hat gewonnen!";
      gameOver = true;
    }
  }

  function restartGame() {
    dealCards();
  }

  onMount(() => {
    dealCards();
  });
</script>


<main>
  <h1>Miau Miau</h1>
  <div>
    <h2>Deine Karten:</h2>
    <ul>
      {#each playerCards as card}
        <li
          class="card"
          style="background-color: {card.color};"
          on:mouseover={() => hoveredCard = card}
          on:mouseout={() => hoveredCard = null}
          on:click={() => playCard(card)}
        >
          {card.number}
        </li>
      {/each}
    </ul>
  </div>
  <div>
    <h2>Ablagestapel:</h2>
    <ul>
      {#if lastCard}
        <li
          class="card"
          style="background-color: {lastCard.color};"
          on:mouseover={() => hoveredCard = lastCard}
          on:mouseout={() => hoveredCard = null}
        >
          {lastCard.number}
        </li>
      {/if}
    </ul>
  </div>
  <div>
    <button on:click={drawCard} disabled={!canDraw || gameOver}>Karte ziehen</button>
  </div>
  <div>
    <h2>KI Karten:</h2>
    <ul>
      {#each aiCards as card}
        <li
          class="card"
          style="background-color: {card.color};"
          on:mouseover={() => hoveredCard = card}
          on:mouseout={() => hoveredCard = null}
        >
          {card.number}
        </li>
      {/each}
    </ul>
  </div>
  <div>
    <button on:click={runPrompt} disabled={gameOver}>KI Spielzug</button>
  </div>
  <div>
    <h2>KI Antwort:</h2>
    <p>{aiResponse}</p>
  </div>
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
      <p>Farbe: {hoveredCard.color}</p>
      <p>Zahl: {hoveredCard.number}</p>
    </div>
  {/if}
</main>