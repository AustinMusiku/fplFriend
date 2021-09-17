const hamMenu = document.querySelector('.hamburger-menu');
const hamLayers = document.querySelectorAll('.ham-layer');
const navLinks = document.querySelector('.nav-links')


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