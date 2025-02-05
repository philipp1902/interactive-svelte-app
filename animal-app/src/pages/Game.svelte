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

  function scheduleAITurn() {
    if (!gameOver) {
      setTimeout(() => {
        aiPlayTurn();
      }, 2000);
    }
  }

  function aiPlayTurn() {
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
      animateCardToDiscard(aiCard, () => {
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
        console.log("KI legt ab:", aiCard);
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
      drawCardForAI(1);

      /*setTimeout(() => {
        aiPlayTurn();
      }, 600);*/
    }
    checkGameOver();
  }

  function drawCardForPlayer(count = 1) {
    const drawPile = document.querySelector(".draw-card-button");

    const playerHand = document.getElementById("player-hand");

    for (let i = 0; i < count; i++) {
      if (deck.length === 0) {
        deck = shuffleDeck(discardPile.slice(0, -1));
        discardPile = [discardPile[discardPile.length - 1]];
      }

      const drawnCard = deck.pop();
      animateCardToHand(drawPile, playerHand, () => {
        playerCards = [...playerCards, drawnCard];
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
    }
    checkGameOver();
  }

  async function generateTooltipText(card) {
    if (!card || !card.number) return;
    try {
      const prompt = `Gib mir 3 sehr kurze Fakten über das Tier ${card.animal}. Maximal 10 Wörter pro Fakt. Als eine unordered list.`;
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });
      card.tooltipText = response.choices[0].message.content;
    } catch (error) {
      console.error("Error generating tooltip text:", error);
      card.tooltipText = "Error generating tooltip text.";
    }
  }

  async function preloadTooltips() {
    const cardsToPreload = [];

    for (const card of playerCards) {
      if (card.animal && !card.tooltipText) {
        cardsToPreload.push(generateTooltipText(card));
      }
    }

    if (lastCard && lastCard.animal && !lastCard.tooltipText) {
      cardsToPreload.push(generateTooltipText(lastCard));
    }

    await Promise.all(cardsToPreload);
  }

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
    const drawPile = document.querySelector(".draw-card-button");
    const playerHand = document.querySelector(".list-container");

    if (canDraw && deck.length > 0) {
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
        scheduleAITurn();
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
        scheduleAITurn();
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
      scheduleAITurn();
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
        scheduleAITurn();
      } else if (card.type === "Aussetzen") {
        canDraw = false;
        message = "Der Gegner darf keine Karte ablegen.";
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
        aiPlayTurn();
        return;
      } else {
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
        scheduleAITurn();
      }
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
    scheduleAITurn();
  }

  function swapRandomCards() {
    const randomPlayerCardIndex = Math.floor(
      Math.random() * playerCards.length
    );
    const randomAiCardIndex = Math.floor(Math.random() * aiCards.length);

    const tempCard = playerCards[randomPlayerCardIndex];
    playerCards[randomPlayerCardIndex] = aiCards[randomAiCardIndex];
    aiCards[randomAiCardIndex] = tempCard;

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
    preloadTooltips();
    window.addEventListener("mousemove", handleMouseMove);
  });

  function animateCardToDiscard(card, callback) {
    const cardEl = document.querySelector(`button[data-card-id="${card.id}"]`);
    if (!cardEl) {
      if (callback) callback();
      return;
    }

    const discardContainer = document.querySelector(".discard-draw-container");
    if (!discardContainer) {
      if (callback) callback();
      return;
    }

    const cardRect = cardEl.getBoundingClientRect();
    const discardRect = discardContainer.getBoundingClientRect();

    const clone = cardEl.cloneNode(true);

    clone.style.position = "absolute";
    clone.style.top = cardRect.top + "px";
    clone.style.left = cardRect.left + "px";
    clone.style.width = cardRect.width + "px";
    clone.style.height = cardRect.height + "px";
    clone.style.transition = "transform 0.5s ease-in-out";
    clone.style.zIndex = 9999;

    document.body.appendChild(clone);

    clone.getBoundingClientRect();

    const targetX =
      discardRect.left +
      discardRect.width / 2 -
      (cardRect.left + cardRect.width / 2);
    const targetY =
      discardRect.top +
      discardRect.height / 2 -
      (cardRect.top + cardRect.height / 2);

    clone.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.5)`;

    clone.addEventListener("transitionend", () => {
      clone.remove();
      if (callback) callback();
    });
  }

  function animateCardToHand(from, to, callback) {
    console.log("Animation gestartet", from, to);

    const clone = document.createElement("div");
    clone.className = "card animated";
    clone.style.backgroundImage = "url('images/ruckseite.png')";

    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();

    clone.style.position = "fixed";
    clone.style.top = `${fromRect.top}px`;
    clone.style.left = `${fromRect.left}px`;
    clone.style.width = `${fromRect.width}px`;
    clone.style.height = `${fromRect.height}px`;
    clone.style.transition = "transform 0.5s ease-in-out";
    clone.style.zIndex = "1000";

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      setTimeout(() => {
        clone.style.transform = `translate(${toRect.left - fromRect.left}px, ${toRect.bottom - fromRect.bottom}px)`;
      }, 1);
    });

    clone.addEventListener("transitionend", (event) => {
      if (event.target === clone && event.propertyName === "transform") {
        console.log("Animation beendet für:", clone);
        clone.remove();
        if (callback) callback();
      }
    });
  }

  function drawCardForAI(count = 1) {
    const drawPile = document.querySelector(".draw-card-button");
    const aiHand = document.getElementById("ai-hand");
    for (let i = 0; i < count; i++) {
      if (deck.length === 0) {
        deck = shuffleDeck(discardPile.slice(0, -1));
        discardPile = [discardPile[discardPile.length - 1]];
      }
      const drawnCard = deck.pop();
      animateCardToHand(drawPile, aiHand, () => {
        aiCards = [...aiCards, drawnCard];
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
    }
  }
</script>

<header>
  <div class="content-container">
    <img src="/images/logo-colored.png" alt="Colored Logo" />
  </div>
  <h1>PAW</h1>
  <p>
    Du willst wissen, wie das Spiel funktioniert?
    <a href="#/explanation" style="text-decoration: underline;"
      >Finde es hier raus!</a
    >
  </p>
  <nav>
    <a href="#/">Home</a>
    <!-- <a href="#/game">Spiel</a>
    <a href="#/explanation">Erklärung</a> -->
  </nav>
</header>
<main>
  <div>
    <ul id="ai-hand" class="list-container">
      {#each aiCards as card}
        <button
          class={`card ${card.type ? "special " + card.type.toLowerCase().replace(" ", "-") : ""} ${getHabitatClass(card.habitat)}`}
          style="background-image: url('images/ruckseite.png');border: none;pointer-events: none;"
          data-card-id={card.id}
        >
        </button>
      {/each}
    </ul>
  </div>

  <div>
    <button on:click={aiPlayTurn} disabled={gameOver}>KI Spielzug</button>
  </div>

  <div class="discard-draw-container">
    <div>
      <ul>
        {#if lastCard}
          <li
            class={`card ${lastCard.type ? "special " + lastCard.type.toLowerCase().replace(" ", "-") : ""} ${getHabitatClass(lastCard.habitat)}`}
            style="background-color: {lastCard.color}; background-image: url('{getBackgroundImage(
              lastCard.animal
            )}'); position: relative;"
            on:mouseover={() => (hoveredCard = lastCard)}
            on:mouseout={() => (hoveredCard = null)}
            on:focus={() => {
              hoveredCard = lastCard;
              generateTooltipText(lastCard);
            }}
            on:blur={() => (hoveredCard = null)}
          >
            {#if lastCard.type}
              {#if lastCard.type === "Farbwahl" || lastCard.type === "Tauschen"}
                <img
                  src={lastCard.type === "Farbwahl"
                    ? "/images/farbwahl.png"
                    : "/images/tauschen.png"}
                  alt="{lastCard.type} Icon"
                  style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; z-index: 1000;"
                />
              {:else}
                {lastCard.type}
              {/if}
            {:else}
              <span
                class="number {getHabitatClass(lastCard.habitat)}"
                style="position: absolute; top: -5px; left: 5px;"
              >
                {lastCard.number}
              </span>
              <span
                class="number {getHabitatClass(lastCard.habitat)}"
                style="position: absolute; bottom: -5px; right: 5px;"
              >
                {lastCard.number}
              </span>
            {/if}

            {#if lastCard.habitat === "Regenwald"}
              <img
                src="/images/regenwald.png"
                alt="Regenwald Icon"
                style="position: absolute; top: 5px; right: 5px; width: 25%; z-index: 10;"
              />
              <img
                src="/images/regenwald.png"
                alt="Regenwald Icon"
                style="position: absolute; bottom: 5px; left: 5px; width: 25%; z-index: 10;"
              />
            {/if}
            {#if lastCard.habitat === "Ozean"}
              <img
                src="/images/ozean.png"
                alt="Ozean Icon"
                style="position: absolute; top: 5px; right: 5px; width: 25%; z-index: 10;"
              />
              <img
                src="/images/ozean.png"
                alt="Ozean Icon"
                style="position: absolute; bottom: 5px; left: 5px; width: 25%; z-index: 10;"
              />
            {/if}
            {#if lastCard.habitat === "Wüste"}
              <img
                src="/images/Wuste.png"
                alt="Wüste Icon"
                style="position: absolute; top: 5px; right: 5px; width: 20%; z-index: 10;"
              />
              <img
                src="/images/Wuste.png"
                alt="Wüste Icon"
                style="position: absolute; bottom: 5px; left: 5px; width: 20%; z-index: 10;"
              />
            {/if}
            {#if lastCard.habitat === "Savanne"}
              <img
                src="/images/savanne.png"
                alt="Savanne Icon"
                style="position: absolute; top: 5px; right: 5px; width: 25%; z-index: 10;"
              />
              <img
                src="/images/savanne.png"
                alt="Savanne Icon"
                style="position: absolute; bottom: 5px; left: 5px; width: 25%; z-index: 10;"
              />
            {/if}
          </li>
        {/if}
      </ul>
    </div>
    <div>
      <DrawCardButton onDraw={drawCard} />
    </div>
  </div>

  <div>
    <ul id="player-hand" class="list-container">
      {#each playerCards as card, index}
        <button
          class={`card ${card.type ? "special " + card.type.toLowerCase().replace(" ", "-") : ""} ${getHabitatClass(card.habitat)}`}
          style="background-color: {card.color}; background-image: url('{getBackgroundImage(
            card.animal
          )}');position: relative; padding: 5px;"
          data-card-id={card.id}
          on:mouseover={() => (hoveredCard = card)}
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
                src={card.type === "Farbwahl"
                  ? "/images/farbwahl.png"
                  : "/images/tauschen.png"}
                alt="{card.type} Icon"
                style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; z-index: 1000;"
              />
            {:else}
              {card.type}
            {/if}
          {:else}
            <span
              class="number {getHabitatClass(card.habitat)}"
              style="position: absolute; top: -5px; left: 5px;"
            >
              {card.number}
            </span>
            <span
              class="number {getHabitatClass(card.habitat)}"
              style="position: absolute; bottom: -5px; right: 5px;"
            >
              {card.number}
            </span>
            {#if card.habitat === "Regenwald"}
              <img
                src="/images/regenwald.png"
                alt="Regenwald Icon"
                style="position: absolute; top: 5px; right: 5px; width: 25%;"
              />
              <img
                src="/images/regenwald.png"
                alt="Regenwald Icon"
                style="position: absolute; bottom: 5px; left: 5px; width: 25%;"
              />
            {/if}
            {#if card.habitat === "Ozean"}
              <img
                src="/images/ozean.png"
                alt="Ozean Icon"
                style="position: absolute; top: 5px; right: 5px; width: 25%;"
              />
              <img
                src="/images/ozean.png"
                alt="Ozean Icon"
                style="position: absolute; bottom: 5px; left: 5px; width: 25%;"
              />
            {/if}
            {#if card.habitat === "Wüste"}
              <img
                src="/images/Wuste.png"
                alt="Wüste Icon"
                style="position: absolute; top: 5px; right: 5px; width: 20%;"
              />
              <img
                src="/images/Wuste.png"
                alt="Wüste Icon"
                style="position: absolute; bottom: 5px; left: 5px; width: 20%;"
              />
            {/if}
            {#if card.habitat === "Savanne"}
              <img
                src="/images/savanne.png"
                alt="Savanne  Icon"
                style="position: absolute; top: 5px; right: 5px; width: 25%;"
              />
              <img
                src="/images/savanne.png"
                alt="Savanne Icon"
                style="position: absolute; bottom: 5px; left: 5px; width: 25%;"
              />
            {/if}
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
      style="position: fixed; left: 20%; top: 500px;"
    >
      <img
        src={getBackgroundImageColored(hoveredCard.animal)}
        alt={hoveredCard.animal}
        style="width: 100%; display: block; margin-bottom: 10px; object-fit: fill; border-radius: 5px;"
      />
      <h2>{hoveredCard.animal}</h2>
      <p>{hoveredCard.habitat}</p>
      <p>
        {@html hoveredCard.tooltipText
          ? hoveredCard.tooltipText.replace(/-/g, "<br>-")
          : "Loading..."}
      </p>
    </div>
  {/if}
</main>

<style>
  .card {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    transform-origin: center center;
  }

  .list-container {
    overflow: visible !important;
    display: flex;
    justify-content: center;
  }
  .animated {
    transition: all 0.5s ease-in-out;
    pointer-events: none;
  }
</style>
