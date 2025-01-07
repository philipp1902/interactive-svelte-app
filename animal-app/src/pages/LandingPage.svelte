<script>
  // import { onMount } from 'svelte';

  let router;

  // onMount(() => {
  //   router = document.querySelector('svelte-spa-router');
  // });

  function navigateToGame() {
    router.push('#/game');
  }
</script>

<main>
  <h1>Willkommen zu Miau Miau</h1>
  <p>Klicke auf den Button, um das Spiel zu starten.</p>
  <!-- <button on:click={navigateToGame}>Spiel starten</button> -->
  <button>
    <a href="#/game" style="text-decoration: none; color: inherit;">Spiel starten</a>
  </button>
</main>

<style>
  main {
    text-align: center;
    padding: 20px;
  }
  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
</style>
