# Willkommen zu PAW! (Play. Animal. Wild.) 🐾

PAW ist ein interaktives Kartenspiel, das im Rahmen des Semesterprojekts im Kurs **Programmiersprachen 3** an der **Hochschule für Gestaltung (HfG) Schwäbisch Gmünd** entwickelt wurde. Das Ziel des Spiels ist es, als erster Spieler alle eigenen Karten abzulegen. Auf den Karten werden interessante Fakten zu den abgebildeten Tieren präsentiert, die während des Spiels eingeblendet werden.

## Spielregeln 🚨

Jeder Spieler erhält zu Beginn 7 Karten. Beim Ablegen muss die Karte entweder die gleiche Farbe oder die gleiche Zahl wie die vorherige Karte haben. Sonderkarten bringen zusätzliche Spannung ins Spiel, indem sie das Geschehen beeinflussen. Der Spieler, der als Erster alle seine Karten ablegt, gewinnt die Runde.

## Projektarchitektur & Technischer Stack 🗄

### Frontend

- **SvelteKit mit TypeScript**: Für die schnelle und moderne Entwicklung der Benutzeroberfläche.
- **CSS**: Für das Styling der Anwendung.

### API

- **OpenAI API**: Für das Abrufen von Tierfakten.

### Animationslogik

- Die Kartenbewegungen sind für beide Spieler durch eigene Animationen umgesetzt.

### Backend
- **LocalStorage** für das Caching von Tooltips

### Verzeichnisstruktur

```plaintext
/animal-app
│── public/               # Statische Dateien (Bilder, Logos)
│── src/
│   ├── assets/           # Weitere Assets (Icons, Grafiken)
│   ├── components/       # Wiederverwendbare UI-Komponenten
│   ├── css/              # Stylesheets für das Design
│   ├── pages/            # Hauptseiten der App (Game, LandingPage, Explanation)
│   ├── store.js          # Zustandsspeicherung mit Svelte Store
│   ├── App.svelte        # Haupteinstiegspunkt der Anwendung
│── .env.example          # Beispiel für Umgebungsvariablen
│── package.json          # Abhängigkeiten und Skripte
│── svelte.config.js      # Svelte Konfigurationsdatei
│── vite.config.js        # Vite Konfigurationsdatei
│── README.md             # Dokumentation
```

## Funktionen 📋

### 🎴 Karten
Die Karten sind in vier Farben unterteilt, die verschiedene Lebensräume darstellen und durch Icons unterstützt werden. Jede Karte zeigt ein Tier, das zu diesem Lebensraum gehört. Die Werte reichen von 1 bis 9 und sind auch auf der Seite integriert.

### 🃏 Sonderkarten
Mit der Tauschenkarte wird zufällig eine Karte mit dem Gegner getauscht. Die Farbwahlkarte ermöglicht es, eine beliebige Farbe bzw. einen Lebensraum auszuwählen.

### 🦥 Tierinformationen
Beim Hovern über eine Karte erscheinen das Tierbild, der Name, drei interessante Fakten und der zugehörige Lebensraum im Hintergrund. Diese Informationen werden über die OpenAI-API bereitgestellt und im localStorage gecached.

### 📖 Seitenunterteilung
Die Landing Page bietet eine Einführung ins Spiel und Verlinkungen zu den anderen Seiten. Auf der Game Page kann das Spiel gespielt werden, während die Explanation Page die Regeln erklärt.

### 🧠 Spiellogik
Das Spiel unterscheidet zwischen Spieler und KI. Es wird geprüft, ob eine Karte spielbar ist – falls ja, wird sie animiert abgelegt. Andernfalls zieht man eine Karte. Die KI entscheidet eigenständig, ob sie eine Karte legt oder zieht, inklusive Sonderkarten. Pro Runde darf nur einmal gezogen werden.

## Design 💻
### 🎨 Colors
```plaintext
- #F7EEDF - Primärfarbe für Text und Buttons
- #1C1A1B - Backgroundcolor und Text auf hellem Hintergrund
- # FFAB24 - Wüste
- #047A54 - Regenwald
- #544CF5 - Ozean
- #F7552C - Savanne
```
### 📜 Schrift
#### Schriftart
- Funnel Display von [Google Fonts](https://fonts.google.com/specimen/Funnel+Display?categoryFilters=Feeling:/Expressive/Calm)
#### Überschriften
- H1 - 4rem, semibold
- H2 - 1.4rem, semibold
- P, A, Button - 1.1rem, normal

## Technische Details ⚙

## Installation 🛠️
```plaintext
# Repository klonen
git clone https://github.com/philipp1902/interactive-svelte-app.git
cd animal-app

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## Konfiguration ✏️

.env-Datei ändern
```plaintext
VITE_UNSPLASH_ACCESS_KEY=eigener_api_key
```

## Quellen 🔗
- [Unsplash](https://unsplash.com/de) für Bilder
- Icons von [StreamlineHQ](https://www.streamlinehq.com/icons/material-symbols-outlined-line) (oder selbst erstellt)
- Font von [Google Fonts](https://fonts.google.com/specimen/Funnel+Display?categoryFilters=Feeling:/Expressive/Calm)


