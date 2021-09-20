let imagesUrl = 'https://resources.premierleague.com/premierleague/photos/players/110x140/p'
let baseUrl = 'http://192.168.43.34:3000'
//let baseUrl = 'https://fplfriend.herokuapp.com'

const graphQlUrl = `${baseUrl}/graphql`

const getFixtures = async () => {
    try{
        let url = `${baseUrl}/fixtures`;
        let response = await fetch(url);
        let fixtures = await response.json();
        return fixtures;
    }catch(err){
        throw err;
    }
}

const getAllPlayers = async () => {
    try {
        let response = await fetch(`${baseUrl}/players/`);
        let players = await response.json();
        return players;
    } catch (err) {
        throw err;
    }
}

const getAllTeams = async () => {
    try {
        let url = `${baseUrl}/teams/`;
        let response = await fetch(url);
        let teams = await response.json();
        return teams;
    } catch (err) {
        throw err;
    }
}

const getPlayerById = async (playerId) => {
    try{
        let url = `${baseUrl}/player/${playerId}/`;
        let response = await fetch(url);
        let player = await response.json();
        return player;
    }catch(err){
        throw err;
    }
}
const getPlayerEventsById = async (playerId) => {
    try{
        let url = `${baseUrl}/playerEvents/${playerId}/`;
        let response = await fetch(url);
        let player = await response.json();
        return player;
    }catch(err){
        throw err;
    }
}

const getPlayersByTeam = async (teamId) => {
    try{
        let url = `${baseUrl}/playersin/${teamId}`;
        let response = await fetch(url);
        let players = await response.json()
        return players;
    }catch(err){
        throw err;
    }
}

const getTeamById = async(teamId) => {
    let teams = await getAllTeams();
    let team = teams.filter(team => team.id == teamId);
    return team[0];
}

const getGws = async () => {
    let url = `${baseUrl}/gameweeks/`
    let response = await fetch(url);
    let gws = await response.json();
    return gws;
}

const getGw = async () => {
    let gws = await getGws();
    const gw = gws.filter(gw => gw.is_current == true)
    return gw[0];
}


// graphql fetch
const graphQlQueryFetch = async (query) => {
    let response =  await fetch( graphQlUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        mode: 'cors',
        body: JSON.stringify({ query: query })
    })
    let data = response.json()
    return data;
}