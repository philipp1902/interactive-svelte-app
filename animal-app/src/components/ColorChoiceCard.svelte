<script>
    export let onPlay;
    export let onColorChoice;
    export let currentCardType; // Add a prop to receive the current card type
    export let removeCard = () => {}; // Add a prop to handle card removal with a default function
    let colorChoiceMenuOpen = false;
    const colors = ['rot', 'gelb', 'grün', 'blau'];

    function selectColor(color) {
        onColorChoice(color);
        colorChoiceMenuOpen = false;
        removeCard(); // Remove the card after selecting the color
    }

    function handlePlay() {
        if (currentCardType !== 'SkipCard') { // Check if the current card is not a SkipCard
            colorChoiceMenuOpen = true;
            onPlay();
            removeCard();
        }
    }
</script>

<div>
    <button on:click={handlePlay} disabled={currentCardType === 'SkipCard'}>Farbwahl</button> <!-- Disable button if current card is SkipCard -->
    {#if colorChoiceMenuOpen}
        <div class="color-choice-menu">
            {#each colors as color}
                <button on:click={() => selectColor(color)}>{color}</button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .color-choice-menu {
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
    }
</style>
