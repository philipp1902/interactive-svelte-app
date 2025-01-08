<!-- <script>
  export let color;
  export let onPlay;
  let colors = ["rot", "gelb", "grün", "blau"];
  let deck = [];

  colors.forEach(c => {
    deck.push({ color: c });
  });

  function playCard(card) {
    console.log(`Playing card with color: ${card.color}`);
    if (card.color === color || color === "wild") {
      onPlay(card);
    }
  }
</script>

{#each deck as card}
<button on:click={() => playCard(card)} class="draw-card-button" style="background-color: {card.color}">
  {card.color.charAt(0).toUpperCase() + card.color.slice(1)}
</button>
{/each} -->
