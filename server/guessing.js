const createGame = () => {

    let players = new Map();
    let guesses = new Map();
    let points = new Map();
    let host = null;
    let solution = null;
    let roundFinished = false;
    


    const resetPlayers = () => {
        guesses.clear();
        players.clear();
        points.clear();
    }

    

    const makeGuess = (sock, value) => {
        if(roundFinished || solution === null || sock.id === host){
            return false;
        }
        let player = players.get(sock.id);
        if(player !== undefined){
            guesses.set(player, value);
            return true;
        }
    }



    const joinGame = (socketID, player) => {
        if(guesses.get(player) !== undefined || players.get(socketID) !== undefined){
            return false;
        }
        players.set(socketID, player);
        guesses.set(player, null);
        points.set(player, 0);
        return true;
    }



    const getGuesses = () => {
        let guessesTemp = new Map();
        
        guesses.forEach((val, key, map) => {
            guessesTemp.set(key, isReady() ? val : (val === null ? '...' : '???'));
        });
        return guessesTemp;
    }



    const evaluateWinner = () => {
        if(!isReady()){
            return null;
        }
        let winnerNames = [];
        let smallestDer = null;

        guesses.forEach((val, key, map) => {
            let der = Math.abs(solution - val);
            if(smallestDer === null || der < smallestDer){
                winnerNames = [];
                smallestDer = der;
            }
            if(der === smallestDer){
                winnerNames.push(key);
            }
        });
        winnerNames.forEach(winnerName => {
            addPoints(winnerName, 1);
        });
        roundFinished = true;
        return winnerNames;
    }



    const addPoints = (player, amount) => {
        let playerPoints = points.get(player);
        if(playerPoints === undefined){
            return;
        }
        points.set(player, (playerPoints+amount));
        return points;
    }



    const getPoints = () => {
        return points;
    }



    const removePlayer = (socketID) => {
        let player = players.get(socketID);
        if(player !== undefined){
            guesses.delete(player);
            points.delete(player);
            players.delete(socketID);
        }
        if(socketID === host){
            host = null;
        }
    }



    const applyForHost = (socketID)  => {
        if(host === null){
            host = socketID;
            return true;
        }
        if(host === socketID){
            host = null;
            nextRound();
            return true;
        }
        return false;
    }



    const getHostName = () => {
        let hostname = players.get(host);
        if(hostname === undefined){
            hostname = '';
        }
        return hostname;
    }


    const submitSolution = (socketID, val) => {
        if(roundFinished || host !== socketID){
            return false;
        }
        solution = val;
        resetGuesses();
        return true;
    }


    const nextRound = (socketID) => {
        if(host !== socketID){
            return false;
        }
        solution = null;
        resetGuesses();
        roundFinished = false;
        return true;
    }


    const resetGuesses = () => {
        guesses.forEach((val, key, map) => {
            guesses.set(key, null);
        });
    }

    const getSolution = () => {
        return isReady() ? solution : (solution === null ? '...' : '???');
    }


    const isReady = () => {
        let ready = true;
        let hostname = getHostName();
        guesses.forEach((val, key, map) => {
            if(val === null && key !== hostname){
                ready = false;
            }
        });
        return ready;
    }

    return {
        resetPlayers, makeGuess, joinGame, getGuesses, removePlayer, evaluateWinner, getPoints, applyForHost, getHostName, submitSolution, nextRound, getSolution
    };
};

module.exports = createGame;