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
  <div class="content-container">
    <div class="text-content">
      <h1>Willkommen in der wilden Welt von PAW!</h1> <br>
      <p>Entdecke wilde Tiere, lerne spannende Fakten und erlebe tierischen Spielspaß – das Kartenspiel, das Wissen und Action verbindet!</p>
      <button>
        <a href="#/game" style="text-decoration: none; color: inherit;">Jetzt spielen</a>
      </button>
      <br><br><br><br>
      <p>Du willst wissen, wie das Spiel funktioniert?<a href="#/explanation" style="text-decoration: underline;">Finde es hier raus!</a></p>
    </div>
    <div class="image-content">
      <img src="/images/card-test.png" alt="Ein thematisches Bild" />
    </div>
  </div>
</main>

<style>
  main {padding: 20px;}
  :global(body) {
    background-image: url('/images/Frontpage.png');
    background-size: cover;
    background-position: center;
    margin: 0;
    height: 100vh;
    width: 100vw;
  }

  main {
    padding: 20px;
  }
  .content-container {
    display: flex;
    gap: 20px; /* Abstand zwischen Text und Bild */
    max-width: 100%; /* Maximale Breite des Containers */
    gap: 20px;
    max-width: 100%;
    align-items: center;
  }
  .text-content {
    width: 50%;
  }
  .image-content {
    flex: 1; /* Das Bild nimmt den restlichen Platz ein */
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .image-content img {
    max-width: 100%; /* Das Bild passt sich dem verfügbaren Platz an */
    max-height: 100vh; /* Das Bild überschreitet nicht die Bildschirmhöhe */
    max-width: 100%;
    max-height: 100vh;
  }

  @media (max-width: 1000px) {
    .content-container {
      flex-direction: column;
    }
    .image-content {
      order: -1;
    }
    .text-content {
      width: 100%;
    }
    .page-content {
      padding: 20px;
    }
  }

  @media (max-width: 600px) {
    .landing-container {
      padding: 1rem;
    }
  
    h1 {
      font-size: 1.8rem;
    }
    
    button {
      width: 100%;
      max-width: 280px;
      margin: 0.5rem auto;
    }
  }
</style>