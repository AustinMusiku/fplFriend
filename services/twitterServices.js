const { Promise } = require('node-fetch');
const { getAllPlayers, getPlayerEventsById } = require('../controllers/fetchControllers');
const { sendTweet } = require('../controllers/twitterControllers');

let medals = ['🥇','🥈','🥉','🏅','🎖']

// -----  -----
// helper functions 
// -----  -----
const computeCaptains = async () => {
    let players = await getAllPlayers();
    // create opponent, fdr(fixture difficulty rating), and captaincy field for each player
    let captains = await players
        .filter(p => p.now_cost > 75 && p.chance_of_playing_next_round != 75 && p.chance_of_playing_next_round != 50 && p.chance_of_playing_next_round != 25)
        .map(async captain => {
            let playerEvents = await getPlayerEventsById(captain.id);
            let upcomingFixture = playerEvents.fixtures[0]
            let history = captain.form*0.3 + captain.points_per_game*0.3 + (captain.bps/captain.minutes)*0.4;
            let captaincy = (history*0.50 + (5 - upcomingFixture.difficulty)*0.50).toFixed(2);
            
            return {
                ...captain,
                history: history,
                fdr: upcomingFixture.difficulty,
                captaincy: captaincy
            }
        })
    return captains;
}

// -----  -----
// send functions 
// -----  -----

// send top players
const sendTopPlayers = async () => {
    let players = await getAllPlayers();
    
    let topPlayers = players
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 5)
    let tweet = `The top 5 players so far: \n\n${topPlayers.map(player => `${medals[topPlayers.indexOf(player)]} ${player.web_name} - ${player.total_points} points`).join('\n')}`;
    sendTweet(tweet);
}

// send captain picks
const sendCaptainPicks = async () => {
    let captainPromises = await computeCaptains();
    // resolve captain promises
    Promise.all(captainPromises)
        .then(captains => {
            let sortedCaptains = captains
                .sort((a,b) => b.captaincy - a.captaincy)
                .slice(0,3);
            let tweet = `Our top captain picks are: \n\n${sortedCaptains.map(captain => `${medals[sortedCaptains.indexOf(captain)]} ${captain.first_name} ${captain.second_name}`). join('\n')} \n\nSee more detailed info on our captain picks at https://fplfriend.herokuapp.com/captains`
            sendTweet(tweet);
    })
}
sendCaptainPicks();
// sendTopPlayers();
// send differentials

// send price actions

// send injuries and bans