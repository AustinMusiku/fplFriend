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
        hamLayer.classList.toggle('active');
    })
}

// shift nav focus on scroll

let lastScroll = 0;

document.addEventListener('scroll', () => {
    // console.log(scrollY)
    let currentScroll = scrollY;

    if(currentScroll <= 0){
        nav.classList.remove('scroll-up')
    }

    if(currentScroll > lastScroll && !nav.classList.contains('scroll-down')){
        nav.classList.remove('scroll-up');
        nav.classList.add('scroll-down');
    }
    
    if(currentScroll < lastScroll && nav.classList.contains('scroll-down')){
        nav.classList.remove('scroll-down');
        nav.classList.add('scroll-up');
    }

    lastScroll = currentScroll;
})