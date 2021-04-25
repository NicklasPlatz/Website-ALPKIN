const createGame = () => {

    let players = new Map();
    let guesses = new Map();
    let points = new Map();
    let solution = 12;
    


    const resetGuesses = () => {
        guesses.clear();
        players.clear();
        points.clear();
    }

    

    const makeGuess = (player, value) => {
        return guesses.set(player, value);
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
        let ready = true;
        guesses.forEach((val, key, map) => {
            if(val === null){
                ready = false;
            }
        });
        guesses.forEach((val, key, map) => {
            guessesTemp.set(key, ready ? val : (val === null ? '...' : '???'));
        });
        return guessesTemp;
    }



    const evaluateWinner = () => {
        let ready = true;
        guesses.forEach((val, key, map) => {
            if(val === null){
                ready = false;
            }
        });
        if(!ready){
            console.log('return');
            return null;
        }
        console.log('no return');
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
            players.delete(socketID);
        }
    }

    return {
        resetGuesses, makeGuess, joinGame, getGuesses, removePlayer, evaluateWinner, getPoints
    };
};

module.exports = createGame;