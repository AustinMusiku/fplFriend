const fetch = require('node-fetch');
const urls = require('./urls');

const { myCache } = require('./cacheControllers');
const { promiseImpl } = require('ejs');

const getFixtures = async () => {
    try{
        let fixtures = myCache.get('fixtures');
        if(fixtures){
            return fixtures;
        }else{
            let url = urls.fixtures;
            let response = await fetch(url, {
                headers: {
                'User-Agent': 'ANYTHING_WILL_WORK_HERE'
                }
            });
            fixtures = await response.json();
            myCache.set('fixtures', fixtures, 172800);
            return fixtures;
        }

    }catch(err){
        console.log(err);
    }
}

const getAllPlayers = async () => {
    try {
        let players = myCache.get('players');

        if(players){
            return players;
        }else{
            let url = urls.general;
            let response = await fetch(url, {
                headers: {
                    'User-Agent': 'XXXXXX'
                }
            });
            let json = await response.json();
            players = json.elements;
            myCache.set('players', players, 172800)
            return players;
        }
    } catch (err) {
        throw err;
    }
}

const getAllTeams = async () => {
    try{
        let teams = myCache.get('teams');
        if(teams){
            return teams;
        }else{
            let url = urls.general;
            let response = await fetch(url, {
                headers: {
                    'User-Agent': 'XXXXXX'
                }
            });
            let json = await response.json();
            teams = json.teams;
            myCache.set('teams', teams, 172800);
            return teams;
        }
    }catch(err){
        throw err;
    }
}

const getPlayerEventsById = async (playerId) => {
    try{
        let player = myCache.get(`${playerId}`);
        if(player){
            return player;
        }else{
            let url = `${urls.playerById}/${playerId}/`;
            let response = await fetch(url, {
                headers: {
                    'User-Agent': 'XXXXXX'
                }
            });
            let player = await response.json();
            myCache.set(`${playerId}`, player, 172800)
            return player;
        }
    }catch(err){
        console.log(err);
    }
}

const getPlayerDataById = async (playerId) => {
    try{
        let players = await getAllPlayers();
        let player = players.filter( player => player.id == playerId );
        return player;
    }catch(err){
        throw err;
    }
}

const getPlayersByTeam = async (teamId) => {
    try{
        let allPlayers = await getAllPlayers();
        let filteredPlayers = allPlayers.filter(player => player.team == teamId );
        return filteredPlayers;
    }catch(err){
        console.log(err);
    }
}

module.exports = { getFixtures,getPlayerEventsById,getPlayerDataById,getAllPlayers,getAllTeams,getPlayersByTeam };