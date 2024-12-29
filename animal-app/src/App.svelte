<!-- <script>
    import OpenAI from "openai";
    import { lastAnimal, lastName } from "./store.js";
    import History from "./components/History.svelte";
  
    let inputText = "";
    let inputTextAnimal = "";
    let responseText = "";
    let animalImage = "";
    let animalLink = "";
    let includeImage = false;
    let animalSummary = "";
    let historyName = "";
  
    const config = {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    };
  
    const openai = new OpenAI(config);
  
    async function runPrompt() {
      try {
        lastAnimal.set(responseText);
        lastName.set(historyName);
        // const prompt = `Find the name of an animal that sounds most similar to a given name and answer with nothing but the name of that animal. E.g. for the input "Leo", answer with "Lion". Start with the name "${inputText}".`;
        const prompt = `Du bist mein Gegner in dem SPiel Uno. Ich lege folgende Karte: "${inputText}".Du hast noch 4 Karten zr Auswahl. Welche Karte legst du?`;
  
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        });
  
        console.log("API-Response:", response);
        // Update history
        responseText = response.choices[0].message.content;
        responseText = responseText.replace(/[^\w\s-]/g, "");
        historyName = inputText;
        // Fetch Wikipedia link and summary
        const wikiResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${responseText}&prop=info|extracts&inprop=url&exintro=1`,
        );
        const wikiData = await wikiResponse.json();
        const pages = wikiData.query.pages;
        const page = Object.values(pages)[0];
        animalLink = page.fullurl || "#";
        animalSummary = page.extract || "No summary available.";
        console.log("Wikipedia Summary:", animalSummary);
  
        if (includeImage) {
          // Generate an image using DALL-E
          const imagePrompt = `Create a realistic ${responseText} mixed with ${inputTextAnimal}.The Mix should be a 50/50 combination of both animals. The animal should be in a natural environment.`;
          const imageResponse = await openai.images.generate({
            prompt: imagePrompt,
            n: 1,
            size: "512x512",
          });
  
          animalImage = imageResponse.data[0].url;
        }

        
      } catch (error) {
        console.error(
          "Error while retrieving the parental animals, Wikipedia link, or generating the image:",
          error,
        );
      }
    }

    
  </script>
  
  <div>
    <input type="text" placeholder="Enter a name" bind:value={inputText} />
    <input type="text" placeholder="Enter a animal to mix with" bind:value={inputTextAnimal} />
    <button on:click={runPrompt}>Get Spirit Animal</button>
    <label>
      <input type="checkbox" bind:checked={includeImage} />
      Include Image
    </label>
  </div>
  
  <p>
    Your Spirit Animal: <a href={animalLink} target="_blank">{responseText}</a>
  </p>
  {#if animalImage}
    <img src={animalImage} alt="Humanized Animal" />
  {/if}
  
  {#if animalSummary}
    <div class="summary">
      {@html animalSummary}
    </div>
  {/if}
  <History />
  
  <style>
    .summary {
      margin-top: 1em;
      padding: 1em;
      background-color: #6a0dad7a;
      border: 1px solid #1e0233;
      max-width: 600px;
    }
  </style> -->


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
  - Top card of the discard pile: "${lastCard.color} ${lastCard.number}"
  - Your hand: ${aiCards.map(card => `${card.color} ${card.number}`).join(', ')}
  
  Which card will you play? If you need to draw a card, just say "draw".
        `;
  
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        });
  
        aiResponse = response.choices[0].message.content;
        if (aiResponse.toLowerCase().includes("draw")) {
          drawCardForAI();
        } else {
          const aiCard = aiCards.find(card => aiResponse.includes(`${card.color} ${card.number}`));
          if (aiCard && (aiCard.color === lastCard.color || aiCard.number === lastCard.number)) {
            aiCards = aiCards.filter(card => card !== aiCard);
            discardPile.push(aiCard);
            lastCard = aiCard;
            canDraw = true; // Erlaubt dem Spieler wieder zu ziehen
            message = "";
          } else {
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
      discardPile = [deck[14]]; // Die erste Karte des Ablagestapels
      lastCard = discardPile[0];
      canDraw = true;
      gameOver = false;
      message = "";
    }
  
    function drawCard() {
      if (canDraw && deck.length > 0) {
        const drawnCard = deck.pop();
        playerCards = [...playerCards, drawnCard];
        canDraw = false; // Nur einmal ziehen erlaubt
        message = "Du kannst nur einmal pro Runde ziehen.";
      } else if (deck.length === 0) {
        // Wenn der Stapel leer ist, den Ablagestapel mischen und als neuen Stapel verwenden
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
      } else {
        // Wenn der Stapel leer ist, den Ablagestapel mischen und als neuen Stapel verwenden
        deck = shuffleDeck(discardPile.slice(0, -1));
        discardPile = [discardPile[discardPile.length - 1]];
        const drawnCard = deck.pop();
        aiCards = [...aiCards, drawnCard];
      }
      checkGameOver();
    }
  
    function playCard(card) {
      if (card.color === lastCard.color || card.number === lastCard.number) {
        playerCards = playerCards.filter(c => c !== card);
        discardPile.push(card);
        lastCard = card;
        canDraw = true; // Erlaubt dem Spieler wieder zu ziehen
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
          <li class="card" style="background-color: {card.color};" on:click={() => playCard(card)}>
            {card.number}
          </li>
        {/each}
      </ul>
    </div>
    <div>
      <h2>Ablagestapel:</h2>
      <ul>
        {#if lastCard}
          <li class="card" style="background-color: {lastCard.color};">{lastCard.number}</li>
        {/if}
      </ul>
    </div>
    <div>
      <h2>KI Karten:</h2>
      <ul>
        {#each aiCards as card}
          <li class="card" style="background-color: {card.color};">{card.number}</li>
        {/each}
      </ul>
    </div>
    <div>
      <button on:click={drawCard} disabled={!canDraw}>Karte ziehen</button>
    </div>
    <div>
      <button on:click={runPrompt}>KI Spielzug</button>
    </div>
    <div>
      <h2>KI Antwort:</h2>
      <p>{aiResponse}</p>
    </div>
    <div>
      <h2>Nachricht:</h2>
      <p>{message}</p>
    </div>
  </main>
  
  <style>
    main {
      text-align: center;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    
  </style>
  