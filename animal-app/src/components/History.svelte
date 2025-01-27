<script>
  import { gameStore } from "../store";

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
      hoveredCard,
    } = $gameStore);
  }
</script>

<div class="container">
  <h1>Spielstand</h1>
  <div>
    <h2>Deine Karten:</h2>
    <ul class="card-grid">
      {#each playerCards as card}
        <li class="card" style="background-color: {card.color};">
          {card.number}
        </li>
      {/each}
    </ul>
  </div>
  <div>
    <h2>Ablagestapel:</h2>
    <ul>
      {#if lastCard}
        <li class="card" style="background-color: {lastCard.color};">
          {lastCard.number}
        </li>
      {/if}
    </ul>
  </div>
  <div>
    <h2>KI Karten:</h2>
    <ul class="card-grid">
      {#each aiCards as card}
        <li class="card" style="background-color: {card.color};">
          {card.number}
        </li>
      {/each}
    </ul>
  </div>
  <div>
    <h2>KI Antwort:</h2>
    <p>{aiResponse}</p>
  </div>
  <div>
    <h2>Nachricht:</h2>
    <p>{message}</p>
  </div>
  <div>
    <h2>Spielstatus:</h2>
    <p>{gameOver ? "Spiel beendet" : "Spiel läuft"}</p>
  </div>
  <div>
    <h2>Karten im Deck:</h2>
    <p>{deck.length} Karten</p>
  </div>
  <div>
    <h2>Karten im Ablagestapel:</h2>
    <p>{discardPile.length} Karten</p>
  </div>
  <div>
    <h2>Kann ziehen:</h2>
    <p>{canDraw ? "Ja" : "Nein"}</p>
  </div>
  {#if hoveredCard}
    <div class="tooltip">
      <p>Farbe: {hoveredCard.color}</p>
      <p>Zahl: {hoveredCard.number}</p>
    </div>
  {/if}
</div>
