<script>
    import { lastAnimal, lastName } from "../store.js";
    import { onDestroy } from "svelte";

    let animal;
    let name;

    const unsubscribeAnimal = lastAnimal.subscribe((value) => {
        // wenn der store-wert sich ändert, wird der neue Wert in die lokale Variable animal geschrieben
        animal = value;
    });

    const unsubscribeName = lastName.subscribe((value) => {
        name = value;
    });

    onDestroy(() => {
        // Unsubscribe-Funktionen sind die Rückgabewerte einer Subscription
        unsubscribeAnimal();
        unsubscribeName();
    });
</script>

<div class="history">
    <h3>Last Entry</h3>
    <p>Name: {name}</p>
    <p>Animal: {animal}</p>
</div>

<style>
    .history {
        box-sizing: border-box;
        position: absolute;
        top: 0;
        right: 0;
        padding: 1em;
        background-color: #333;
        color: white;
        height: 100vh;
        width: 200px;
    }
</style>