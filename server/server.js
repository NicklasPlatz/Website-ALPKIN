const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const createGame = require('./guessing');
const { join } = require('path');

const app = express();

app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);
const { resetPlayers, joinGame, makeGuess, getGuesses, removePlayer, evaluateWinner, getPoints, applyForHost, getHostName, nextRound, submitSolution, getSolution } = createGame();




const joinGuessingGame = (sock) => (playerName) => {

  if(playerName === 'ResetGame'){
    resetPlayers();
    io.to('guessingGame').emit('reset');
    return;
  }

  const joined = joinGame(sock.id, playerName);
  console.log(joined);
  if(joined){
    sock.join('guessingGame');
    io.to(sock.id).emit('joined', playerName);
  }else{
    console.log("already joined");
    io.to(sock.id).emit('joined', '');
  } 

  let guesses = getGuesses();
  io.to('guessingGame').emit('guesses', JSON.stringify([...guesses]));
  let points = getPoints();
  io.to('guessingGame').emit('points', JSON.stringify([...points]));
  let host = getHostName();
  io.to('guessingGame').emit('host', host);
  let solution = getSolution();
  io.to('guessingGame').emit('solution', solution);
}




const guessSubmit = (sock) => (value) => {

  if(makeGuess(sock, value)){

    let guesses = getGuesses();
    io.to('guessingGame').emit('guesses', JSON.stringify([...guesses]));
    let winner = evaluateWinner();
    if(winner !== null){
      io.to('guessingGame').emit('winner', JSON.stringify(winner));
    }
    let points = getPoints();
    io.to('guessingGame').emit('points', JSON.stringify([...points]));
    let solution = getSolution();
    io.to('guessingGame').emit('solution', solution);
  }
}



const applyHost = (sock) => () => {
  let success = applyForHost(sock.id);
  if(success){
    let host = getHostName();
    io.to('guessingGame').emit('host', host);
    let solution = getSolution();
    io.to('guessingGame').emit('solution', solution);
    let guesses = getGuesses();
    io.to('guessingGame').emit('guesses', JSON.stringify([...guesses]));
    let points = getPoints();
    io.to('guessingGame').emit('points', JSON.stringify([...points]));
  }
}



const startNextRound = (sock) => () => {
  let success = nextRound(sock.id);
  if(success){
    let solution = getSolution();
    io.to('guessingGame').emit('solution', solution);
    let guesses = getGuesses();
    io.to('guessingGame').emit('guesses', JSON.stringify([...guesses]));
    let points = getPoints();
    io.to('guessingGame').emit('points', JSON.stringify([...points]));
  }
}



const submitNewSolution = (sock) => (newSol) => {
  let success = submitSolution(sock.id, newSol);
  if(success){
    let solution = getSolution();
    io.to('guessingGame').emit('solution', solution);
    let guesses = getGuesses();
    io.to('guessingGame').emit('guesses', JSON.stringify([...guesses]));
    let points = getPoints();
    io.to('guessingGame').emit('points', JSON.stringify([...points]));
  }
}



io.on('connection', (sock) => {
  console.log('new connection');
  io.to(sock.id).emit('message', 'You are connected');

  sock.on('message', (text) => io.emit('message', text));

  sock.on('joinGuessingGame', joinGuessingGame(sock));

  sock.on('guessSubmit', guessSubmit(sock));

  sock.on('solutionSubmit', submitNewSolution(sock));

  sock.on('nextRound', startNextRound(sock));

  sock.on('applyHost', applyHost(sock));
  
  sock.on('disconnect', () => {
    removePlayer(sock.id);
    let solution = getSolution();
    io.to('guessingGame').emit('solution', solution);
    let guesses = getGuesses();
    io.to('guessingGame').emit('guesses', JSON.stringify([...guesses]));
    let points = getPoints();
    io.to('guessingGame').emit('points', JSON.stringify([...points]));
  });
  
});

server.on('error', (err) => {
  console.error(err);
});
 
server.listen(8080, () => {
  console.log('server is ready');
});