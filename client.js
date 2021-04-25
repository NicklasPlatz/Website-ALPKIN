
const joinGame = (sock) => (e) => {
  e.preventDefault();

  const playerInput = document.querySelector('#player-input');
  const playerValue = playerInput.value;
  
  if(playerValue != ''){
    playerInput.value = '';
    sock.emit('joinGuessingGame', playerValue);
  }
};



const applyHost = (sock) => (e) => {
  e.preventDefault();

  sock.emit('applyHost');
}



const onValueSubmitted = (sock) => (e) => {
    e.preventDefault();

    const input = document.querySelector('#guess-input');
    const value = input.value;
    input.value = '';
    
    if(value != ''){
      sock.emit('guessSubmit', value);
    }
};

const onSolutionSubmitted = (sock) => (e) => {
  e.preventDefault();

  const input = document.querySelector('#solution-input');
  const value = input.value;
  input.value = '';
  
  if(value != ''){
    sock.emit('solutionSubmit', value);
  }
};



const nextRound = (sock) => (e) => {
  e.preventDefault();
  sock.emit('nextRound');
}



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
      let playerName = document.createElement('div');
      playerName.classList.add('player-name');
      playerName.textContent = key;
      let playerPoints = document.createElement('div');
      playerPoints.classList.add('player-points');
      playerPoints.textContent = '...';
      if(key === sessionStorage.getItem('hostname')){
        playerCard.classList.add('host');
        playerGuess.textContent = 'Host';
      }
      playerCard.appendChild(playerGuess);
      playerCard.appendChild(playerName);
      playerCard.appendChild(playerPoints);
    players.appendChild(playerCard);
  });
}


const resize_to_fit = (element) => {
  if(element.textContent.length > 5){
    element.style.fontSize = '36px';
  }
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


const handleHost = (sock) => (host) => {
  let hostEl = document.getElementById('host-name');
  let hostname = host === null ? "..." : host;
  hostEl.innerHTML = 'Host: '+hostname;
  sessionStorage.setItem('hostname', hostname);
  let playerName = sessionStorage.getItem('playerName');
  if(playerName === hostname){
    document.getElementById('host-controls').style.display = "flex";
    document.getElementById('player-controls').style.display = "none";
  }else{
    document.getElementById('player-controls').style.display = "flex";
    document.getElementById('host-controls').style.display = "none";
  }
  //host === null ? hostEl.classList.add('activeHost') : hostEl.classList.remove('activeHost') ;
}



const handleSolution = (sock) => (sol) => {
  let solEl = document.getElementById('solution-value');
  solEl.innerHTML = sol;
}


(() => {

  const sock = io();

  sock.on('message', handleMessage(sock));
  sock.on('joined', handleJoined(sock));
  sock.on('guesses', handleGuesses(sock));
  sock.on('winner', handleWinner(sock));
  sock.on('points', handlePoints(sock));
  sock.on('reset', handleReset(sock));
  sock.on('host', handleHost(sock));
  sock.on('solution', handleSolution(sock));
  document.querySelector('#lobby-form').addEventListener('submit', joinGame(sock));
  document.querySelector('#guess-form').addEventListener('submit', onValueSubmitted(sock));
  document.querySelector('#solution-form').addEventListener('submit', onSolutionSubmitted(sock));
  document.getElementById('next-round').addEventListener('click', nextRound(sock));
  document.getElementById('host-apply').addEventListener('click', applyHost(sock));
})();


  