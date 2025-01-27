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
    import Router from "svelte-spa-router";
    import LandingPage from "./pages/LandingPage.svelte";
    import Game from "./pages/Game.svelte";
    import Explanation from "./pages/Explanation.svelte";

  
    const routes = {
      "/": LandingPage,
      "/game": Game,
      "/explanation": Explanation,
    };
</script>
  
  <!-- <header>
    <h1>Miau Miau</h1>
    <nav>
      <a href="#/">Home</a>
      <a href="#/game">Spiel</a>
      <a href="#/explanation">Erklärung</a>
    </nav>
  </header> -->
  <main>
    <Router {routes} />
    <!-- <svelte:component this={currentRoute?.component} /> -->
  </main>
  
  <style>
    main {
      text-align: center;
      padding: 20px;
    }
  </style>
  