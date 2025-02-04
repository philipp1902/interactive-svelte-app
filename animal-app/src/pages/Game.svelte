<script>
  import { onDestroy, onMount } from "svelte";
  import DrawCardButton from "../components/DrawCardButton.svelte";
  import { gameStore } from "../store";
  import OpenAI from "openai";
  import DrawTwoCard from "../components/DrawTwoCard.svelte";
  import SkipCard from "../components/SkipCard.svelte";
  import ColorChoiceCard from "../components/ColorChoiceCard.svelte";
  import { animalImages } from "../animalImages.js";
  import { animalImagesColored } from "../animalImagescolored.js";

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
  let chosenColor = "";
  let colorChoiceMenuOpen = false;
  let mouseX = 0;
  let mouseY = 0;
  let showTooltip = false;
  const colors = ["rot", "gelb", "grün", "blau"];
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const specialCards = ["Farbwahl", "Tauschen"];


  const habitats = {
    rot: "Savanne",
    gelb: "Wüste",
    blau: "Ozean",
    grün: "Regenwald",
  };

  const myColors = {
    gelb: "#FFAB24",
    grün: "#037A54",
    blau: "#544CF5",
    rot: "#F7562C",
  };

  const animals = {
    rot: [
      "Afrikanischer Löwe",
      "Afrikanischer Elefant",
      "Masai-Giraffe",
      "Steppenzebra",
      "Blaues Gnu",
      "Gepard",
      "Spitzmaulnashorn",
      "Braune Hyäne",
      "Afrikanischer Strauß",
    ],
    gelb: [
      "Dromedar",
      "Fennek",
      "Dünenskorpion",
      "Sandchamäleon",
      "Erdmännchen",
      "Palmatogecko",
      "Nubischer Geier",
      "Goldene Radspinne",
      "Westliche Diamant-Klapperschlange",
    ],
    blau: [
      "Blauwal",
      "Gemeiner Delfin",
      "Weißer Hai",
      "Kurzschnäuziges Seepferdchen",
      "Pazifischer Riesenkrake",
      "Clownfisch",
      "Unechte Karettschildkröte",
      "Stechrochen",
      "Kompassqualle",
    ],
    grün: [
      "Schwarzer Panther",
      "Fischertukan",
      "Kapuzineraffe",
      "Hoffmanns Faultier",
      "Großer Ameisenbär",
      "Ara",
      "Blauer Morphofalter",
      "Pfeilgiftfrosch",
      "Papageienschlange",
    ],
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
      hoveredCard,
    } = $gameStore);
  }

  function aiPlayTurn() {
    if (!canDraw) {
      canDraw = true;
      message = "Du darfst keine Karte ablegen.";
      gameStore.set({
        playerCards,
        aiCards,
        deck,
        discardPile,
        lastCard,
        canDraw,
        message,
        gameOver,
        aiResponse,
        hoveredCard,
      });
      if (playableCards.length > 0) {
        const aiCard = playableCards[Math.floor(Math.random() * playableCards.length)];
        const aiHand = document.querySelector("ul.list-container");
        const discardPile = document.querySelector(".discard-draw-container");
        
        animateCardToDiscard(aiCard, () => {
            aiCards = aiCards.filter((card) => card !== aiCard);
            discardPile.push(aiCard);
            lastCard = aiCard;
            // ... rest of the AI logic
        });
    }
      return;
    }

    const playableCards = aiCards.filter(
  (card) =>
    (card.color === lastCard.color && card.type !== "Farbwahl") ||
    card.number === lastCard.number ||
    (specialCards.includes(card.type) && card.type === lastCard.type) ||
    (card.type === "Aussetzen" && card.color === lastCard.color) ||
    (card.type === "Zieh 2" && card.color === lastCard.color) ||
    (card.type === "Tauschen" && card.color === lastCard.color) ||
    card.type === "Farbwahl"
);
    if (playableCards.length > 0) {
      const aiCard =
        playableCards[Math.floor(Math.random() * playableCards.length)];
      aiCards = aiCards.filter((card) => card !== aiCard);
      discardPile.push(aiCard);
      lastCard = aiCard;
      canDraw = true;
      message = "";
      if (aiCard.type === "Zieh 2") {
        drawCardForPlayer(2);
      } else if (aiCard.type === "Aussetzen") {
        canDraw = false;
      } else if (aiCard.type === "Farbwahl") {
        const randomColorCard =
          aiCards[Math.floor(Math.random() * aiCards.length)];
        chosenColor = randomColorCard.color;
        lastCard.color = chosenColor;
        gameStore.set({
          playerCards,
          aiCards,
          deck,
          discardPile,
          lastCard,
          canDraw,
          message,
          gameOver,
          aiResponse,
          hoveredCard,
        });
      } else if (aiCard.type === "Tauschen") {
        swapRandomCards();
      }
      console.log("AI played:", aiCard);
      gameStore.set({
        playerCards,
        aiCards,
        deck,
        discardPile,
        lastCard,
        canDraw,
        message,
        gameOver,
        aiResponse,
        hoveredCard,
      });
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
    const response = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-4"
      messages: [{ role: "user", content: prompt }],
    });
    tooltipText = response.choices[0].message.content;
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
      grün: new Set(),
    };

    for (const color of colors) {
      const shuffledAnimals = animals[color]
        .slice()
        .sort(() => Math.random() - 0.5);
      let animalIndexCounter = 0;

      for (const number of numbers) {
        const animal = shuffledAnimals[animalIndexCounter];
        animalIndex[color].add(animal);
        newDeck.push({
          id: id++,
          color,
          number,
          habitat: habitats[color],
          animal,
        });
        animalIndexCounter++;
      }
    }

    for (const special of specialCards) {
      if (special === "Aussetzen" || special === "Zieh 2" || "Tauschen") {
        for (const color of colors) {
          newDeck.push({
            id: id++,
            type: special,
            color,
            habitat: habitats[color],
          });
        }
      } else {
        for (let i = 0; i < 4; i++) {
          newDeck.push({
            id: id++,
            type: special,
            habitat: habitats[colors[i]],
          });
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
    gameStore.set({
      playerCards,
      aiCards,
      deck,
      discardPile,
      lastCard,
      canDraw,
      message,
      gameOver,
      aiResponse,
      hoveredCard,
    });
  }

  function drawCard() {
    if (canDraw && deck.length > 0) {
        const drawnCard = deck.pop();
        const drawPile = document.querySelector(".draw-card-button");
        const playerHand = document.querySelector(".list-container");

        animateCardToHand(drawPile, playerHand, () => {
            playerCards = [...playerCards, drawnCard];  // Füge die Karte erst nach der Animation hinzu
            canDraw = false;
            message = "Du kannst nur einmal pro Runde ziehen.";
            gameStore.set({
                playerCards,
                aiCards,
                deck,
                discardPile,
                lastCard,
                canDraw,
                message,
                gameOver,
                aiResponse,
                hoveredCard,
            });
        });

    } else if (deck.length === 0) {
        deck = shuffleDeck(discardPile.slice(0, -1));
        discardPile = [discardPile[discardPile.length - 1]];
        const drawnCard = deck.pop();
        animateCardToHand(drawPile, playerHand, () => {
            playerCards = [...playerCards, drawnCard];  
            canDraw = false;
            message = "Du kannst nur einmal pro Runde ziehen.";
            gameStore.set({
                playerCards,
                aiCards,
                deck,
                discardPile,
                lastCard,
                canDraw,
                message,
                gameOver,
                aiResponse,
                hoveredCard,
            });
        });

    } else {
        message = "Du kannst nur einmal pro Runde ziehen.";
        gameStore.set({
            playerCards,
            aiCards,
            deck,
            discardPile,
            lastCard,
            canDraw,
            message,
            gameOver,
            aiResponse,
            hoveredCard,
        });
    }
    checkGameOver();
}


  function drawCardForAI(count) {
    for (let i = 0; i < count; i++) {
      if (i + 1 < count) {
        //neue bedingung
        const drawnCard = deck.pop();
        aiCards = [...aiCards, drawnCard];
        console.log("AI drew a card:", drawnCard);
        canDraw = true;
        gameStore.set({
          playerCards,
          aiCards,
          deck,
          discardPile,
          lastCard,
          canDraw,
          message,
          gameOver,
          aiResponse,
          hoveredCard,
        });
      } else {
        deck = shuffleDeck(discardPile.slice(0, -1));
        discardPile = [discardPile[discardPile.length - 1]];
        const drawnCard = deck.pop();
        aiCards = [...aiCards, drawnCard];
        console.log(
          "AI drew a card from the reshuffled discard pile:",
          drawnCard
        );
        canDraw = true;
        gameStore.set({
          playerCards,
          aiCards,
          deck,
          discardPile,
          lastCard,
          canDraw,
          message,
          gameOver,
          aiResponse,
          hoveredCard,
        });
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
    gameStore.set({
      playerCards,
      aiCards,
      deck,
      discardPile,
      lastCard,
      canDraw,
      message,
      gameOver,
      aiResponse,
      hoveredCard,
    });
  }

  function animateCardToDiscard(card, callback) {
    // Hole das originale Karten-Element im DOM über data-card-id
    const cardEl = document.querySelector(`button[data-card-id="${card.id}"]`);
    if (!cardEl) {
      // Falls es die Karte nicht mehr gibt, führe den callback direkt aus
      if (callback) callback();
      return;
    }

    // Wähle einen Container, dessen "Mitte" als Ziel dient (z. B. der Ablage-Container)
    const discardContainer = document.querySelector(".discard-draw-container");
    if (!discardContainer) {
      if (callback) callback();
      return;
    }

    // Bounding-Rechtecke: Start (Karte) und Ziel (Container)
    const cardRect = cardEl.getBoundingClientRect();
    const discardRect = discardContainer.getBoundingClientRect();

    // Erstelle einen Klon der Karte
    const clone = cardEl.cloneNode(true);

    // Kopiere die wichtigsten Stile und setze absolute Position
    clone.style.position = "absolute";
    clone.style.top = cardRect.top + "px";
    clone.style.left = cardRect.left + "px";
    clone.style.width = cardRect.width + "px";
    clone.style.height = cardRect.height + "px";
    clone.style.transition = "transform 0.5s ease-in-out";
    clone.style.zIndex = 9999; // damit der Klon über allen anderen Elementen liegt

    // Füge den Klon ins DOM (body) ein
    document.body.appendChild(clone);

    // Einmaliges „Neuberechnen“, damit die Transition greift
    clone.getBoundingClientRect();

    // Zielkoordinaten: Mitte des discardContainers
    const targetX =
      discardRect.left +
      discardRect.width / 2 -
      (cardRect.left + cardRect.width / 2);
    const targetY =
      discardRect.top +
      discardRect.height / 2 -
      (cardRect.top + cardRect.height / 2);

    // Setze die Transform-Eigenschaften für die Animation
    clone.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.5)`;

    // Sobald die Transition abgeschlossen ist, entfernen wir den Klon und rufen den Callback auf
    clone.addEventListener("transitionend", () => {
      clone.remove();
      if (callback) callback();
    });
  }

  function playCard(card) {
    if (card.type === "Farbwahl") {
      discardPile.push(card);
      lastCard = card;
      colorChoiceMenuOpen = true;
      gameStore.set({
        playerCards,
        aiCards,
        deck,
        discardPile,
        lastCard,
        canDraw,
        message,
        gameOver,
        aiResponse,
        hoveredCard,
      });
      removeCard(card);
      return;
    }

    if (
      (card.color !== lastCard.color && card.number !== lastCard.number) ||
      (lastCard.type === "Farbwahl" && card.color !== chosenColor) ||
      (card.type === "Aussetzen" &&
        lastCard.type !== "Aussetzen" &&
        card.color !== lastCard.color) ||
      (card.type === "Zieh 2" &&
        lastCard.type !== "Zieh 2" &&
        card.color !== lastCard.color) ||
      (card.type === "Tauschen" &&
        lastCard.type !== "Tauschen" &&
        card.color !== lastCard.color)
    ) {
      message = "Du kannst diese Karte nicht ablegen.";
      gameStore.set({
        playerCards,
        aiCards,
        deck,
        discardPile,
        lastCard,
        canDraw,
        message,
        gameOver,
        aiResponse,
        hoveredCard,
      });
      return;
    }

    if (card.type === "Tauschen") {
      discardPile.push(card);
      lastCard = card;
      swapRandomCards();
      playerCards = playerCards.filter((c) => c !== card);
      gameStore.set({
        playerCards,
        aiCards,
        deck,
        discardPile,
        lastCard,
        canDraw,
        message,
        gameOver,
        aiResponse,
        hoveredCard,
      });
      return;
    }

    animateCardToDiscard(card, () => {
      playerCards = playerCards.filter((c) => c !== card);
      discardPile.push(card);
      lastCard = card;
      canDraw = true;
      message = "";

      if (card.type === "Zieh 2") {
        drawCardForAI(2);
      } else if (card.type === "Aussetzen") {
        canDraw = false;
        message = "Der Gegner darf keine Karte ablegen.";
        aiPlayTurn();
      }

      gameStore.set({
        playerCards,
        aiCards,
        deck,
        discardPile,
        lastCard,
        canDraw,
        message,
        gameOver,
        aiResponse,
        hoveredCard,
      });
      checkGameOver();
    });
  }

  function handleColorChoice(color) {
    chosenColor = color;
    lastCard.color = chosenColor;
    colorChoiceMenuOpen = false;
    gameStore.set({
      playerCards,
      aiCards,
      deck,
      discardPile,
      lastCard,
      canDraw,
      message,
      gameOver,
      aiResponse,
      hoveredCard,
    });
  }

  function swapRandomCards() {
    const randomPlayerCardIndex = Math.floor(
      Math.random() * playerCards.length
    );
    const randomAiCardIndex = Math.floor(Math.random() * aiCards.length);

    const tempCard = playerCards[randomPlayerCardIndex];
    playerCards[randomPlayerCardIndex] = aiCards[randomAiCardIndex];
    aiCards[randomAiCardIndex] = tempCard;
    // sichergehen, dass die KI nicht die Tauschkarte bekommt -> funkt aber iwie noch nicht komischerweise
    if (aiCards[randomAiCardIndex].type === "Tauschen") {
      const newRandomAiCardIndex = aiCards.findIndex(
        (card) => card.type !== "Tauschen"
      );
      if (newRandomAiCardIndex !== -1) {
        aiCards[randomAiCardIndex] = aiCards[newRandomAiCardIndex];
        aiCards[newRandomAiCardIndex] = tempCard;
      }
    }
    gameStore.set({
      playerCards,
      aiCards,
      deck,
      discardPile,
      lastCard,
      canDraw,
      message,
      gameOver,
      aiResponse,
      hoveredCard,
    });
  }

  function checkGameOver() {
    if (playerCards.length === 0) {
      message = "Du hast gewonnen!";
      gameOver = true;
      gameStore.set({
        playerCards,
        aiCards,
        deck,
        discardPile,
        lastCard,
        canDraw,
        message,
        gameOver,
        aiResponse,
        hoveredCard,
      });
    } else if (aiCards.length === 0) {
      message = "Die KI hat gewonnen!";
      gameOver = true;
      gameStore.set({
        playerCards,
        aiCards,
        deck,
        discardPile,
        lastCard,
        canDraw,
        message,
        gameOver,
        aiResponse,
        hoveredCard,
      });
    }
  }

  function restartGame() {
    dealCards();
  }

  function removeCard(card) {
    playerCards = playerCards.filter((c) => c !== card);
    discardPile.push(card);
    lastCard = card;
    canDraw = true;
    message = "";
    gameStore.set({
      playerCards,
      aiCards,
      deck,
      discardPile,
      lastCard,
      canDraw,
      message,
      gameOver,
      aiResponse,
      hoveredCard,
    });
    checkGameOver();
  }

  function getBackgroundImage(animal) {
    const imageUrl = animalImages[animal] || "default_image.jpg";
    console.log(`Background image for ${animal}: ${imageUrl}`);
    return imageUrl;
  }
  function getBackgroundImageColored(animal) {
    const imageUrl = animalImagesColored[animal] || "default_image.jpg";
    console.log(`Background image for ${animal}: ${imageUrl}`);
    return imageUrl;
  }
  function getHabitatClass(habitat) {
    return habitat.toLowerCase();
  }

  function handleMouseMove(e) {
    // Verwende entweder e.clientX / e.clientY oder e.pageX / e.pageY
    // pageX/Y berücksichtigt Scrollen, clientX/Y nicht.
    mouseX = e.pageX;
    mouseY = e.pageY;
  }

  onMount(() => {
    window.addEventListener("mousemove", handleMouseMove);
  });

  onDestroy(() => {
    window.removeEventListener("mousemove", handleMouseMove);
  });

  onMount(() => {
    dealCards();
  });

  function animateCardToHand(from, to, callback) {
    console.log("Animation gestartet", from, to);
    
    const clone = document.createElement('div');
    clone.className = 'card animated';
    clone.style.backgroundImage = "url('images/ruckseite.png')";
    
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    
    clone.style.position = 'fixed';
    clone.style.top = `${fromRect.top}px`;
    clone.style.left = `${fromRect.left}px`;
    clone.style.width = `${fromRect.width}px`;
    clone.style.height = `${fromRect.height}px`;
    clone.style.transition = 'transform 0.5s ease-in-out';
    clone.style.zIndex = '1000';
    
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
        setTimeout(() => {
          clone.style.transform = `translate(${toRect.left - fromRect.left}px, ${toRect.bottom - fromRect.bottom}px)`;
        }, 1);
    });

    clone.addEventListener('transitionend', (event) => {
        if (event.target === clone && event.propertyName === 'transform') {
            console.log("Animation beendet für:", clone);
            clone.remove();
            if (callback) callback();
        }
    });
}


</script>

<header>
  <div class="content-container">
    <img src="/images/logo-colored.png" alt="Colored Logo" />
  </div>
  <h1>PAW</h1>
  <p>Du willst wissen, wie das Spiel funktioniert?<a href="#/explanation" style="text-decoration: underline;">Finde es hier raus!</a></p>
  <nav>
    <a href="#/">Home</a>
    <!-- <a href="#/game">Spiel</a>
    <a href="#/explanation">Erklärung</a> -->
  </nav>
</header>
<main>
  <div>
    <!-- <h2>KI Karten:</h2> -->
    <ul class="list-container">
      {#each aiCards as card}
        <button
          class={`card ${card.type ? "special " + card.type.toLowerCase().replace(" ", "-") : ""} ${getHabitatClass(card.habitat)}`}
          style="background-image: url('images/ruckseite.png');border: none;pointer-events: none;"
        >
        </button>
      {/each}
    </ul>
  </div>

  <div>
    <button on:click={aiPlayTurn} disabled={gameOver}>KI Spielzug</button>
  </div>
  <!-- <div>
    <h2>KI Antwort:</h2>
    <p>{aiResponse}</p>
  </div> -->
  <div class="discard-draw-container">
    <div>
      <!-- <h2>Ablagestapel:</h2> -->
      <ul>
        {#if lastCard}
          <li
            class={`card ${lastCard.type ? "special " + lastCard.type.toLowerCase().replace(" ", "-") : ""} ${getHabitatClass(lastCard.habitat)}`}
            style="background-color: {lastCard.color}; background-image: url('{getBackgroundImage(lastCard.animal)}'); position: relative;" 
            on:mouseover={() => {
              hoveredCard = lastCard;
              generateTooltipText(lastCard);
            }}
            on:mouseout={() => (hoveredCard = null)}
            on:focus={() => {
              hoveredCard = lastCard;
              generateTooltipText(lastCard);
            }}
            on:blur={() => (hoveredCard = null)}
          >
          
            <!-- Card Content: Type or Number -->
            {#if lastCard.type}
            {#if lastCard.type === "Farbwahl" || lastCard.type === "Tauschen"}
              <img 
                src={lastCard.type === "Farbwahl" ? "/images/farbwahl.png" : "/images/tauschen.png"} 
                alt="{lastCard.type} Icon" 
                style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; z-index: 1000;" 
              />
            {:else}
              {lastCard.type}
            {/if}
          {:else}
              <span class="number {getHabitatClass(lastCard.habitat)}" style="position: absolute; top: -5px; left: 5px;">
                {lastCard.number}</span>
                <span class="number {getHabitatClass(lastCard.habitat)}" style="position: absolute; bottom: -5px; right: 5px;">
                  {lastCard.number}</span>
            {/if}
    
            <!-- Habitat-Specific Icons -->
            {#if lastCard.habitat === 'Regenwald'}
              <img src="/images/regenwald.png" alt="Regenwald Icon" style="position: absolute; top: 5px; right: 5px; width: 25%; z-index: 10;" />
              <img src="/images/regenwald.png" alt="Regenwald Icon" style="position: absolute; bottom: 5px; left: 5px; width: 25%; z-index: 10;" />
            {/if}
            {#if lastCard.habitat === 'Ozean'}
              <img src="/images/ozean.png" alt="Ozean Icon" style="position: absolute; top: 5px; right: 5px; width: 25%; z-index: 10;" />
              <img src="/images/ozean.png" alt="Ozean Icon" style="position: absolute; bottom: 5px; left: 5px; width: 25%; z-index: 10;" />
            {/if}
            {#if lastCard.habitat === 'Wüste'}
              <img src="/images/Wuste.png" alt="Wüste Icon" style="position: absolute; top: 5px; right: 5px; width: 20%; z-index: 10;" />
              <img src="/images/Wuste.png" alt="Wüste Icon" style="position: absolute; bottom: 5px; left: 5px; width: 20%; z-index: 10;" />
            {/if}
            {#if lastCard.habitat === 'Savanne'}
              <img src="/images/savanne.png" alt="Savanne Icon" style="position: absolute; top: 5px; right: 5px; width: 25%; z-index: 10;" />
              <img src="/images/savanne.png" alt="Savanne Icon" style="position: absolute; bottom: 5px; left: 5px; width: 25%; z-index: 10;" />
            {/if}
          </li>
        {/if}
      </ul>
    </div>
    <div>
      <!-- <h2>Karte ziehen:</h2> -->
      <DrawCardButton onDraw={drawCard} />
    </div>
  </div>
  <div>
    <!-- <h2>Deine Karten:</h2> -->
    <ul class="list-container">
      {#each playerCards as card, index}
        <button
          class={`card ${card.type ? "special " + card.type.toLowerCase().replace(" ", "-") : ""} ${getHabitatClass(card.habitat)}`}
          style="background-color: {card.color}; background-image: url('{getBackgroundImage(
            card.animal
          )}');position: relative; padding: 5px;"
          data-card-id={card.id}
          on:mouseover={() => {
            hoveredCard = card;
            generateTooltipText(card);
          }}
          on:mouseout={() => (hoveredCard = null)}
          on:focus={() => {
            hoveredCard = card;
            generateTooltipText(card);
          }}
          on:blur={() => (hoveredCard = null)}
          on:click={() => playCard(card)}
          on:keydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              playCard(card);
            }
          }}
        >
        {#if card.type}
  {#if card.type === "Farbwahl" || card.type === "Tauschen"}
    <img 
      src={card.type === "Farbwahl" ? "/images/farbwahl.png" : "/images/tauschen.png"} 
      alt="{card.type} Icon" 
      style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; z-index: 1000;" 
    />
  {:else}
    {card.type}
  {/if}
      

          {:else}
            <span class="number {getHabitatClass(card.habitat)}" style="position: absolute; top: -5px; left: 5px;"
              >{card.number}</span
            >
            <span class="number {getHabitatClass(card.habitat)}" style="position: absolute; bottom: -5px; right: 5px;"
              >{card.number}</span
            >
            {#if card.habitat === 'Regenwald'}
              <img src="/images/regenwald.png" alt="Regenwald Icon" style="position: absolute; top: 5px; right: 5px; width: 25%;" />
              <img src="/images/regenwald.png" alt="Regenwald Icon" style="position: absolute; bottom: 5px; left: 5px; width: 25%;" />
            {/if}
            {#if card.habitat === 'Ozean'}
              <img src="/images/ozean.png" alt="Ozean Icon" style="position: absolute; top: 5px; right: 5px; width: 25%;" />
              <img src="/images/ozean.png" alt="Ozean Icon" style="position: absolute; bottom: 5px; left: 5px; width: 25%;" />
            {/if}
            {#if card.habitat === 'Wüste'}
              <img src="/images/Wuste.png" alt="Wüste Icon" style="position: absolute; top: 5px; right: 5px; width: 20%;" />
              <img src="/images/Wuste.png" alt="Wüste Icon" style="position: absolute; bottom: 5px; left: 5px; width: 20%;" />
            {/if}
            {#if card.habitat === 'Savanne'}
              <img src="/images/savanne.png" alt="Savanne Icon" style="position: absolute; top: 5px; right: 5px; width: 25%;" />
              <img src="/images/savanne.png" alt="Savanne  Icon" style="position: absolute; bottom: 5px; left: 5px; width: 25%;" />
            {/if}
            <!-- {#if card.type === "Farbwahl"}
            <img src="/images/tauschen.png" alt="Farbwahl Icon" style="position: absolute; top: 5px; right: 5px; width: 50%; z-index: 100o;" />
            <img src="/images/tauschen.png" alt="Farbwahl Icon"/>
          {/if} -->
          {/if}
        </button>
      {/each}
    </ul>
  </div>
  {#if colorChoiceMenuOpen}
    <div class="overlay">
      <div class="color-choice-menu">
        {#each colors as color}
          <button
            on:click={() => handleColorChoice(color)}
            class={color}
            style="background-color: {myColors[color]};"
            >{habitats[color]}</button
          >
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

  {#if hoveredCard && !hoveredCard.type}
    <div
      class="tooltip"
      role="tooltip"
      style="
      position: fixed;
      left: 20%; 
      top: 500px;"
    >
    <img 
  src="{getBackgroundImageColored(hoveredCard.animal)}" 
  alt="{hoveredCard.animal}" 
  style="width: 100%; display: block; margin-bottom: 10px; object-fit: fill; border-radius: 5px;"
  />
      {#if hoveredCard.type}
        <!-- <p>Typ: {hoveredCard.type}</p> -->
      {:else}
        <!-- <p>Farbe: {hoveredCard.color}</p>
        <p>Zahl: {hoveredCard.number}</p> -->
      {/if}
      <h2>{hoveredCard.animal}</h2>
      <p>{hoveredCard.habitat}</p>
      <p>{tooltipText}</p>
    </div>
  {/if}
</main>

<!-- zieh 2 karten kann man immer noch auf andere karten legen -->
<!-- die karten rutschen unter den text bzw. ul class ist zu klein -->

<!-- Informationen über Tiere auf Stapel hinzufügen -->

<style>
  .card {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .list-container {
    overflow: visible !important;
    display:flex;
    justify-content: center;
  }
  .animated {
    transition: all 0.5s ease-in-out;
    pointer-events: none;
}

.card {
    transform-origin: center center;
}
</style>
