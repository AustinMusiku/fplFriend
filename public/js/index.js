let imagesUrl = 'https://resources.premierleague.com/premierleague/photos/players/110x140/p'
// let baseUrl = 'http://192.168.137.216:3000'
let baseUrl = 'https://fplfriend.herokuapp.com'
const graphQlUrl = `${baseUrl}/graphql`;

const hamMenu = document.querySelector('.hamburger-menu');
const hamLayers = document.querySelectorAll('.ham-layer');
const navLinks = document.querySelector('.nav-links');
const nav = document.querySelector('nav');

// toggle mobile navigation
hamMenu.addEventListener('click', () => {
    animateHamMenu();
    navLinks.classList.toggle('active') 
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
    if(currentScroll > lastScroll && !nav.classList.contains('scroll-down')){ 
        nav.classList.remove('scroll-up');
        nav.classList.add('scroll-down')
    }
    if(currentScroll < lastScroll && nav.classList.contains('scroll-down')){ 
        nav.classList.remove('scroll-down');
        nav.classList.add('scroll-up')
    }
    lastScroll = currentScroll
})

// evaluation methods
const evaluatePosition = (positionId) => { switch (positionId) { case 1: return 'goalkeeper'; case 2: return 'defender'; case 3: return 'midfielder'; case 4: return 'forward'; default: return 'n/a'; } }
const evaluateTeam = (teamId) => { switch (teamId) { case 1:return 'ars'; case 2:return 'avl'; case 3:return 'bre'; case 4:return 'bha'; case 5:return 'bur'; case 6:return 'che'; case 7:return 'cry'; case 8:return 'eve'; case 9:return 'lei'; case 10:return 'lee'; case 11:return 'liv'; case 12: return 'mci'; case 13: return 'mun'; case 14: return 'new'; case 15: return 'nor'; case 16: return 'sou'; case 17: return 'tot'; case 18: return 'wat'; case 19: return 'whu'; case 20: return 'wol'; default: return 'n/a'; } }
const evalutePriceChange = (priceChange) => { if(priceChange == 1){ return 'rise' }  if(priceChange == 0){ return 'equal' }  if(priceChange == -1){ return 'fall' } }


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