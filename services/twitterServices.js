const { getAllPlayers } = require('../controllers/fetchControllers');
const { sendTweet, accountInfo } = require('../controllers/twitterControllers');

// get all players
const players = getAllPlayers();

// send top players
players.then((data) => {
    let topPlayers = 
        data
            .sort((a, b) => b.total_points - a.total_points)
            .slice(0, 5)
    let tweet = `Top 5 players in the league: \n\n${topPlayers.map(player => `${player.web_name} - ${player.total_points} points`).join('\n')}`;
    console.log(tweet);
});

// send captain picks

// send differentials

// send price actions

// send injuries and bans