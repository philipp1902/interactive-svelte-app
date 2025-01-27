<script>
  import { onMount } from 'svelte';
  import DrawCardButton from '../components/DrawCardButton.svelte';
  import { gameStore } from '../store';
  import OpenAI from "openai";
  import DrawTwoCard from '../components/DrawTwoCard.svelte';
  import SkipCard from '../components/SkipCard.svelte';
  import ColorChoiceCard from '../components/ColorChoiceCard.svelte';
  import { animalImages } from '../animalImages.js';

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
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const specialCards = ['Zieh 2', 'Aussetzen', 'Farbwahl', 'Tauschen'];

  const habitats = {
    rot: 'Savanne',
    gelb: 'Wüste',
    blau: 'Ozean',
    grün: 'Regenwald'
  };

  const animals = {
    rot: ['Afrikanischer Löwe', 'Afrikanischer Elefant', 'Masai-Giraffe', 'Steppenzebra', 'Blaues Gnu', 'Gepard', 'Spitzmaulnashorn', 'Braune Hyäne', 'Afrikanischer Strauß'],
    gelb: ['Dromedar', 'Fennek', 'Dünenskorpion', 'Sandchamäleon', 'Erdmännchen', 'Palmatogecko', 'Nubischer Geier', 'Goldene Radspinne', 'Westliche Diamant-Klapperschlange'],
    blau: ['Blauwal', 'Gemeiner Delfin', 'Weißer Hai', 'Kurzschnäuziges Seepferdchen', 'Pazifischer Riesenkrake', 'Clownfisch', 'Unechte Karettschildkröte', 'Stechrochen', 'Kompassqualle'],
    grün: ['Schwarzer Panther', 'Fischertukan', 'Kapuzineraffe', 'Hoffmanns Faultier', 'Großer Ameisenbär', 'Ara', 'Blauer Morphofalter', 'Pfeilgiftfrosch', 'Papageienschlange']
  };

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
    (card.color === lastCard.color && card.type !== 'Farbwahl') || card.number === lastCard.number ||
    (specialCards.includes(card.type) && card.type === lastCard.type) ||
    (card.type === 'Aussetzen' && (card.color === lastCard.color || lastCard.type === 'Aussetzen')) ||      // iwie legt es das trotzdem auf die karte wo es bock hat
    (card.type === 'Zieh 2' && (card.color === lastCard.color || lastCard.type === 'Zieh 2')) ||
    (card.type === 'Tauschen' && (card.color === lastCard.color || lastCard.type === 'Tauschen')) ||
    (card.type === 'Farbwahl')
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
    } else if (aiCard.type === 'Tauschen') {
      swapRandomCards();
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
    if (!card || !card.number) return;
    try {
      const prompt = `Gib mir 3 sehr kurze Fakten über das Tier ${card.animal}. Maximal 10 Wörter pro Fakt. Als eine unordered list.`;
      // const prompt = `Gib mir einen kurzen Satz über die Nummer ${card.number}.`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });
      tooltipText = response.choices[0].message.content;

      // const imagePrompt = `Erstelle ein realistisches und farbenfrohes Bild von einem Känguru mit einem leicht stilisierten Touch`;
      // const imageResponse = await openai.images.generate({
      //   prompt: imagePrompt,
      //   n: 1,
      //   size: "256x256",
      // });
      // koalaImageUrl = imageResponse.data[0].url;
    } catch (error) {
      console.error("Error generating tooltip text:", error);
      tooltipText = "Error generating tooltip text.";
    }
  }

//   async function loadCardImages() {
//   for (let card of playerCards) {
//     if (card.animal) {
//       card.imageUrl = await getWikipediaImage(card.animal);
//     }
//   }
//   for (let card of aiCards) {
//     if (card.animal) {
//       card.imageUrl = await getWikipediaImage(card.animal);
//     }
//   }
//   if (lastCard && lastCard.animal) {
//     lastCard.imageUrl = await getWikipediaImage(lastCard.animal);
//   }
//   gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
// }


function createDeck() {
    const newDeck = [];
    let id = 0;
    const animalIndex = {
      rot: new Set(),
      gelb: new Set(),
      blau: new Set(),
      grün: new Set()
    };

    for (const color of colors) {
      const shuffledAnimals = animals[color].slice().sort(() => Math.random() - 0.5);
      let animalIndexCounter = 0;

      for (const number of numbers) {
        const animal = shuffledAnimals[animalIndexCounter];
        animalIndex[color].add(animal);
        newDeck.push({ id: id++, color, number, habitat: habitats[color], animal });
        animalIndexCounter++;
      }
    }

    for (const special of specialCards) {
      if (special === 'Aussetzen' || special === 'Zieh 2' || 'Tauschen') {
        for (const color of colors) {
          newDeck.push({ id: id++, type: special, color, habitat: habitats[color] });
        }
      } else {
        for (let i = 0; i < 4; i++) {
          newDeck.push({ id: id++, type: special, habitat: habitats[colors[i]] });
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
      if (i+1<count) {            //neue bedingung
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
      (lastCard.type === 'Farbwahl' && card.color !== chosenColor) ||
      (card.type === 'Aussetzen' && lastCard.type !== 'Aussetzen' && card.color !== lastCard.color) ||
      (card.type === 'Zieh 2' && lastCard.type !== 'Zieh 2' && card.color !== lastCard.color) ||
      (card.type === 'Tauschen' && lastCard.type !== 'Tauschen' && card.color !== lastCard.color) 
    ) {
      message = "Du kannst diese Karte nicht ablegen.";
      gameStore.set({ playerCards, aiCards, deck, discardPile, lastCard, canDraw, message, gameOver, aiResponse, hoveredCard });
      return;
    }
 
    if (card.type === 'Tauschen') {
    discardPile.push(card); 
    lastCard = card;
    swapRandomCards();
    playerCards = playerCards.filter(c => c !== card); 
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
    aiPlayTurn(); 
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

  function swapRandomCards() {
  const randomPlayerCardIndex = Math.floor(Math.random() * playerCards.length);
  const randomAiCardIndex = Math.floor(Math.random() * aiCards.length);

  const tempCard = playerCards[randomPlayerCardIndex];
  playerCards[randomPlayerCardIndex] = aiCards[randomAiCardIndex];
  aiCards[randomAiCardIndex] = tempCard;
  // sichergehen, dass die KI nicht die Tauschkarte bekommt -> funkt aber iwie noch nicht komischerweise
  if (aiCards[randomAiCardIndex].type === 'Tauschen') {
    const newRandomAiCardIndex = aiCards.findIndex(card => card.type !== 'Tauschen');
    if (newRandomAiCardIndex !== -1) {
      aiCards[randomAiCardIndex] = aiCards[newRandomAiCardIndex];
      aiCards[newRandomAiCardIndex] = tempCard;
    }
  }
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

  function getBackgroundImage(animal) {
    const imageUrl = animalImages[animal] || 'default_image.jpg';
    console.log(`Background image for ${animal}: ${imageUrl}`);
    return imageUrl;
  }
  function getHabitatClass(habitat) {
    return habitat.toLowerCase();
  }

  onMount(() => {
    dealCards();
  });
</script>
<header>
  <h1>Miau Miau</h1>
  <nav>
    <a href="#/">Home</a>
    <!-- <a href="#/game">Spiel</a>
    <a href="#/explanation">Erklärung</a> -->
  </nav>
</header>
<main>
  <div>
    <h2>KI Karten:</h2>         
    <ul>
      {#each aiCards as card}
        <li
          class={`card ${card.type ? 'special ' + card.type.toLowerCase().replace(' ', '-') : ''} ${getHabitatClass(card.habitat)}`}
          style="background-color: {card.color}; background-image: url('{getBackgroundImage(card.animal)}');"
          on:mouseover={() => hoveredCard = card}
          on:mouseout={() => hoveredCard = null}
        >
          {#if card.type}
            {card.type}
          {:else}
            <span class="number {getHabitatClass(card.habitat)}">{card.number}</span>
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
            class={`card ${lastCard.type ? 'special ' + lastCard.type.toLowerCase().replace(' ', '-') : ''} ${getHabitatClass(lastCard.habitat)}`}
            style="background-color: {lastCard.color}; background-image: url('{getBackgroundImage(lastCard.animal)}');"
            on:mouseover={() => { hoveredCard = lastCard; generateTooltipText(lastCard); }}
            on:mouseout={() => hoveredCard = null}
          >
            {#if lastCard.type}
              {lastCard.type}
            {:else}
              <span class="number {getHabitatClass(lastCard.habitat)}">{lastCard.number}</span>
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
      {#each playerCards as card, index}
        <li
          class={`card ${card.type ? 'special ' + card.type.toLowerCase().replace(' ', '-') : ''} ${getHabitatClass(card.habitat)}`}
          style="background-color: {card.color}; background-image: url('{getBackgroundImage(card.animal)}');"
          data-card-id={card.id}
          on:mouseover={() => { hoveredCard = card; generateTooltipText(card); }}
          on:mouseout={() => hoveredCard = null}
          on:click={() => playCard(card)}
        >
          {#if card.type}
            {card.type}
          {:else}
            <span class="number {getHabitatClass(card.habitat)}">{card.number}</span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
  {#if colorChoiceMenuOpen}
    <div class="overlay">
      <div class="color-choice-menu">
        {#each colors as color}
          <button on:click={() => handleColorChoice(color)} class={color}>{habitats[color]}</button>
        {/each}
      </div>
    </div>
  {/if}
  
<!-- {#if colorChoiceMenuOpen}
<div class="overlay">
  <div class="color-choice-menu">
    <ColorChoiceCard onColorChoice={handleColorChoice} />
  </div>
</div>
{/if} -->
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
      <p>Lebensraum: {hoveredCard.habitat}</p>
      <p>Tier: {hoveredCard.animal}</p>
      <p>{tooltipText}</p>
    </div>
  {/if}
</main>

<style>
  .card {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  
</style>


<!-- zieh 2 karten kann man immer noch auf andere karten legen -->
<!-- die karten rutschen unter den text bzw. ul class ist zu klein -->


<!-- Informationen über Tiere auf Stapel hinzufügen -->