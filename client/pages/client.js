
const joinGame = (sock) => (e) => {
  e.preventDefault();

  const playerInput = document.querySelector('#player-input');
  const playerValue = playerInput.value;
  
  if(playerValue != ''){
    playerInput.value = '';
    sock.emit('joinGuessingGame', playerValue);
  }
};

const onValueSubmitted = (sock) => (e) => {
    e.preventDefault();

    const input = document.querySelector('#guess-input');
    const value = input.value;
    input.value = '';
    
    if(value != ''){
      playerValue = sessionStorage.getItem("playerName");
      sock.emit('guessSubmit', playerValue, value);
    }
};



const handleMessage = (sock) => (msg) => {
  console.log('Message from server: '+msg)
};



const handleJoined = (sock) => (player) => {
  if(player == ''){
    alert("Name is already taken!");
    return;
  }
  sessionStorage.setItem("playerName", player);
  console.log('PlayerName: '+sessionStorage.getItem("playerName"));

  document.getElementById("lobby").style.display = "none";
  document.getElementById('guessingUI').style.display = "flex";
};



const handleGuesses = (sock) => (guessesJSON) => {
  let guesses = new Map(JSON.parse(guessesJSON));
  let players = document.getElementById('players');
  players.innerHTML = '';
  guesses.forEach((val, key, map) => {
    let playerCard = document.createElement('div');
    playerCard.id = key;
    playerCard.classList.add('player');
      let playerGuess = document.createElement('div');
      playerGuess.classList.add('player-guess');
      playerGuess.textContent = val ?? '???';
      playerCard.appendChild(playerGuess);
      let playerName = document.createElement('div');
      playerName.classList.add('player-name');
      playerName.textContent = key;
      playerCard.appendChild(playerName);
      let playerPoints = document.createElement('div');
      playerPoints.classList.add('player-points');
      playerPoints.textContent = 12;
      playerCard.appendChild(playerPoints);
    players.appendChild(playerCard);
  });
}



const handleWinner = (sock) => (winnerJSON) => {
  let winner = JSON.parse(winnerJSON);
  let text = 'Winner:';
  winner.forEach(el => {
    text += (' '+el);
    document.getElementById(el).classList.add('winner');
  });
  console.log(text);
}



const handlePoints = (sock) => (pointsJSON) => {
  let points = new Map(JSON.parse(pointsJSON));
  points.forEach((val, key, map) => {
    document.getElementById(key).children[2].innerHTML = val;
  });
}



const handleReset = (sock) => () => {
  sessionStorage.removeItem("playerName");

  document.getElementById("lobby").style.display = "flex";
  document.getElementById('guessingUI').style.display = "none";
}



(() => {

  const sock = io();

  sock.on('message', handleMessage(sock));
  sock.on('joined', handleJoined(sock));
  sock.on('guesses', handleGuesses(sock));
  sock.on('winner', handleWinner(sock));
  sock.on('points', handlePoints(sock));
  sock.on('reset', handleReset(sock));
  document.querySelector('#lobby-form').addEventListener('submit', joinGame(sock));
  document.querySelector('#guess-form').addEventListener('submit', onValueSubmitted(sock));

})();


  