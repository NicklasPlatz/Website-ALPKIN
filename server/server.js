const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const createGame = require('./guessing');
const { join } = require('path');

const app = express();

app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);
const { resetGuesses, joinGame, makeGuess, getGuesses, removePlayer, evaluateWinner, getPoints } = createGame();




const joinGuessingGame = (sock) => (playerName) => {

  if(playerName === 'ResetGame'){
    resetGuesses();
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
}




const guessSubmit = (sock) => (player, value) => {
  makeGuess(player, value);
  let guesses = getGuesses();
  io.to('guessingGame').emit('guesses', JSON.stringify([...guesses]));
  let points = getPoints();
  io.to('guessingGame').emit('points', JSON.stringify([...points]));
  let winner = evaluateWinner();
  if(winner !== null){
    io.to('guessingGame').emit('winner', JSON.stringify(winner));
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
  
  sock.on('disconnect', () => {
    removePlayer(sock.id);
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