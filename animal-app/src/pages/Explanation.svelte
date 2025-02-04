  <main>
    <div class="content-container">
      <img src="/images/logo-colored.png" alt="Colored Logo" />
    </div>
    <div class="content-container">
      <div class="text-content">
        <h1>Spielbeschreibung</h1> <br>
        <h2>Spielprinzip und Ablauf</h2>
        <p>Es gibt Karten mit Zahlen von 1 bis 9, eingeteilt in 4 Farben, die für verschiedene Lebensräume stehen.</p>
        <ul>
          <li style="color: #544CF5;">Blau für Ozean</li> 
          <li style="color: #037A54;">Grün für Regenwald</li> 
          <li style="color: #F7562C;">Rot für Savanne</li>
          <li style="color: #FFAB24;">Gelb für Wüste</li>
        </ul>  
        <br><p>Jede Karte zeigt ein Tier aus einem der Lebensräume. Wenn du mit der Maus über die Karte fährst, siehst du spannende Infos und ein Bild des Tieres.
        <br>Zu Beginn erhält jeder Spieler 7 Karten. Pro Runde kannst du eine Karte ablegen oder eine Karte ziehen. Nutze deine Karten klug und werde deine Karten so schnell wie möglich los!</p>

        <h2>Sonderkarten für noch mehr Action</h2>
        <p>Neben den Zahlenkarten von 1 bis 9 sorgen diese Spezialkarten für aufregende Wendungen im Spiel:</p>
        <ul>
          <li>Tauschkarte - Tausche eine zufällige Karte mit deinem Gegner.</li>
          <!-- <li>Skip-Karte  – Überspringe die Runde deines Gegners und spiele erneut.</li>  -->
          <li>Farbwahl-Karte  – Wähle einen Lebensraum, den der nächste Spieler spielen muss.</li>
          <!-- <li>Zieh-2-Karte  – Dein Gegner muss zwei zusätzliche Karten ziehen.</li> -->
        </ul>  
        
        <!-- <button>
          <a href="#/game" style="text-decoration: none; color: inherit;">Bereit zu spielen?</a>
        </button> -->
        <br>
        <div style="display: flex; justify-content: space-between; align-items: center; align-content: center;">
          <button>
            <a href="#/game" style="text-decoration: none; color: inherit;">Bereit zu spielen?</a>
          </button>
          <p><a href="#/" style="text-decoration: underline;">Hier gehts zurück zur Startseite</a></p>
        </div>  </div>
      <div class="image-container">
        <div class="image-content">
        <img style="height: 25%" src="/images/explanationcolor.png" alt="Beispiel von Karten" />
      </div>
      <div class="image-content">
        <img style="height: 25%" src="/images/specialcards.png" alt="Beispiel von Karten" />
      </div>
      </div>
  </main>

  <style>
    main {padding: 20px;}
    :global(body) {
      /* background-image: url('/images/Frontpage.png');
      background-size: cover;
      background-position: center; */
      background-color: rgb(15, 15, 15);
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
      align-items: center;
    }
    .text-content {
      width: 50%;
    }
    .image-content {
      flex: 1; /* Das Bild nimmt den restlichen Platz ein */
      display: flex;
      justify-content: center;
      align-items: center;
    }
  
    .image-content img {
      max-width: 72%; /* Das Bild passt sich dem verfügbaren Platz an */
      max-height: 100vh; /* Das Bild überschreitet nicht die Bildschirmhöhe */
    }

    .image-container {
      display: flex;
      gap: 20px; 
      flex-direction: column;
      max-width: 100%; 
      padding-left: 100px;
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
    }
@media (max-width: 640px) {
  .content-container {
    flex-direction: column;
    gap: 10px;
  }
  .image-container {
    padding-left: 0;
  }
  .image-content img {
    max-width: 100%;
  }
  .text-content {
    width: 100%;
    text-align: center;
  }
}

  </style>