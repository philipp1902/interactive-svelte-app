<script>
    export let onPlay;
    export let onColorChoice;
    export let currentCardType;
    export let removeCard = () => {};
    let colorChoiceMenuOpen = true; // Ensure the menu is open for testing
    const habitats = {
      savanne: "Savanne",
      wueste: "Wüste",
      ozean: "Ozean",
      regenwald: "Regenwald",
    };
    const colors = Object.keys(habitats);
  
    const myColors = {
      gelb: "yellow",
      grün: "green",
      blau: "blue",
      rot: "red",
    };
  
    function selectColor(color) {
      onColorChoice(color);
      colorChoiceMenuOpen = false;
      removeCard(); // Remove the card after selecting the color
    }
  
    function handlePlay() {
      if (currentCardType !== "SkipCard") {
        colorChoiceMenuOpen = true;
        onPlay();
        removeCard();
      }
    }
  </script>
  
  <div>
    {#if colorChoiceMenuOpen || currentCardType !== "SkipCard"}
      <div class="color-choice-menu">
        {#each colors as color}
          <button
            on:click={() => selectColor(color)}
            class={color}
            style="background-color: {myColors[color]} !important; "
          >
            {habitats[color]}
          </button>
        {/each}
      </div>
    {/if}
  </div>
  
  <style>
    
    .color-choice-menu .savanne {
      background-color: #f7562c; /* Color for Savanne */ /* Farben in ColorChoice funktionieren noch nicht */
    }
  
    .color-choice-menu .wueste {
      background-color: #ffab24; /* Color for Wüste */
    }
  
    .color-choice-menu .ozean {
      background-color: #544cf5; /* Color for Ozean */
    }
  
    .color-choice-menu .regenwald {
      background-color: #037a54; /* Color for Regenwald */
    }
       
    /* .color-choice-menu {
          display: flex;
          justify-content: center;
          margin-top: 20px;
      }
  
      .color-choice-menu button {
          margin: 0 10px;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          background-color: #007bff;
          color: white;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
      }
  
      .color-choice-menu button:hover {
          background-color: #0056b3;
      }
  
      button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
      } */
  </style>
  