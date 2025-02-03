<script>
    export let onDraw;
  </script>
  
  <button class="draw-card-button" on:click={onDraw}>
  </button>
  
  <style>
    .draw-card-button {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px;
  padding: 20px;
  border-radius: 5px;
  background-image: url('images/ruckseite.png');
  background-size: cover;
  background-position: center; 
  cursor: pointer;
  width: 100px;
  height: 150px;
  /* color: #F7EEDF; */
  font-size: 12px;
  text-align: center;
  line-height: auto;
  transition: background 0.5s ease;
  overflow: hidden;
  border: none;
}

.draw-card-button:hover {
  transition: scale 0.5s ease;
  background-image: url('images/ruckseite.png');
  background-size: cover;
  background-position: center; 
  scale: 1.1;
  /* font-weight:bolder; */
  border: none;
}

@media (max-width: 600px) {
    .draw-card-button {
        width: 60px;
        height: 90px;
        font-size: 12px;
        line-height: auto;
        margin-left: 20px;
    }
}

  </style>