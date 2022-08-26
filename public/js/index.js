let imagesUrl = 'https://resources.premierleague.com/premierleague/photos/players/110x140/p'
// let baseUrl = 'http://192.168.8.139:3000'
let baseUrl = ''
const graphQlUrl = `${baseUrl}/graphql`;

const hamMenu = document.querySelector('.hamburger-menu');
const hamLayers = document.querySelectorAll('.ham-layer');
const navLinks = document.querySelector('.nav-links');
const nav = document.querySelector('nav');
let isNavToggled = false;

// toggle mobile navigation
hamMenu.addEventListener('click', () => {
    animateHamMenu();
    navLinks.classList.toggle('active');
    isNavToggled = !isNavToggled;
})
// animate hamburger menu
const animateHamMenu = () => {
    hamLayers.forEach(hamLayer => { 
        hamLayer.classList.toggle('active') 
    })
}
// shift nav focus on scroll
let lastScroll = 0;
document.addEventListener('scroll', () => {
    let currentScroll = scrollY;
    if(currentScroll <= 0){ 
        nav.classList.remove('scroll-up') 
    }
    // scrolling down
    if(currentScroll > lastScroll && !nav.classList.contains('scroll-down')){ 
        nav.classList.remove('scroll-up');
        if(!isNavToggled){
            nav.classList.add('scroll-down')
        }
    }
    // scrolling up
    if(currentScroll < lastScroll && nav.classList.contains('scroll-down')){ 
        nav.classList.remove('scroll-down');
        nav.classList.add('scroll-up')
    }
    lastScroll = currentScroll
})

// evaluation methods
const evaluatePosition = (positionId) => { switch (positionId) { case 1: return 'goalkeeper'; case 2: return 'defender'; case 3: return 'midfielder'; case 4: return 'forward'; default: return 'n/a'; } }

const evaluateTeam = (teamId) => { switch (teamId) { case 1:return 'ars'; case 2:return 'avl'; case 3:return 'bou'; case 4:return 'bre';case 5:return 'bha'; case 6:return 'che'; case 7:return 'cry'; case 8:return 'eve'; case 9:return 'ful'; case 10:return 'lei'; case 11:return 'lee'; case 12: return 'liv'; case 13: return 'mci'; case 14: return 'mun'; case 15: return 'new'; case 16: return 'nfo'; case 17: return 'sou'; case 18: return 'tot'; case 19: return 'whu'; case 20: return 'wol'; default: return 'n/a'; } }

const evalutePriceChange = (priceChange) => { if(priceChange == 1){ return 'rise' }  if(priceChange == 0){ return 'equal' }  if(priceChange == -1){ return 'fall' } }

const evaluteAlert = (chance_of_playing_next_round) => { if(chance_of_playing_next_round == null || chance_of_playing_next_round == 100){ return 'invisible' }   if(chance_of_playing_next_round == 0 || chance_of_playing_next_round == 25){ return 'red-alert' }   if(chance_of_playing_next_round == 50 || chance_of_playing_next_round == 75){ return 'yellow-alert' } }

const evaluatePrefix = number => {
        let length = number.toString().length;
        if(length < 4){
            // hundreds ( 0 < X < 4)
            return 1
        }else if(length > 3 && length < 7){
            // thousands ( 3 < X < 7)
            return 1000
        }else if(length > 6){
            // millions ( 6 < X )
            return 1000000
        }
        
}

// Fetch methods
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

const fetchCurrentGameweek = async () => {
    const currGwQuery = '{ gameweek(is_current: true) { id }}';
    const response = await graphQlQueryFetch(currGwQuery);
    localStorage.setItem('currentGw', JSON.stringify(response.data.gameweek));
    return response.data.gameweek;
}

const fetchNextGameweek = async () => {
    const nextGwQuery = '{ gameweek(is_next: true) { id deadline_time }}';
    const response = await graphQlQueryFetch(nextGwQuery);
    localStorage.setItem('nextGw', JSON.stringify(response.data.gameweek));
    return response.data.gameweek;
}