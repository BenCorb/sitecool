const bananaCursor = document.getElementById('banana-cursor');
const bananaCursorEnabled = window.matchMedia('(min-width: 601px) and (hover: hover) and (pointer: fine)');
const compactExperience = window.matchMedia('(max-width: 600px), (pointer: coarse)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.addEventListener('mousemove', e => {
    if (!bananaCursorEnabled.matches) return;
    bananaCursor.style.left = (e.pageX - 42) + 'px';
    bananaCursor.style.top = (e.pageY - 5) + 'px';
});

const introScreen = document.getElementById('intro-screen');
const musique = document.getElementById('musique');
const siteHeader = document.getElementById('site-header');
const siteContent = document.getElementById('site-content');
let onBoard = false;

function enterSite() {
    introScreen.classList.add('hidden');
    introScreen.setAttribute('aria-hidden', 'true');
    document.body.classList.add('site-entered');
    siteHeader.setAttribute('aria-hidden', 'false');
    siteHeader.removeAttribute('inert');
    siteContent.setAttribute('aria-hidden', 'false');
    siteContent.removeAttribute('inert');
    musique.play().catch(err => console.warn('Impossible de lire la musique :', err));
    onBoard = true;
}

document.addEventListener('mousedown', () => {
    if (onBoard) {
        explosionDeConfettis();
    }
    if (bananaCursorEnabled.matches) {
        bananaCursor.style.scale = '0.9';
        bananaCursor.style.transition = 'scale 0.1s';
    }
});

document.addEventListener('mouseup', () => {
    if (!bananaCursorEnabled.matches) return;
    bananaCursor.style.scale = '1';
    bananaCursor.style.transition = 'scale 0.1s';
});

function explosionDeConfettis() {
    if (reducedMotion.matches) return;

    const colors = ['#f94144', '#f3722c', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
    const confettiCount = compactExperience.matches ? 48 : 128;
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-25px';
        confetti.style.width = confetti.style.height = (Math.random() * 10 + 5) + 'px';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
}

let stars = [];
const starCount = reducedMotion.matches ? 0 : (compactExperience.matches ? 18 : 30);
for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.top = Math.random() * 100 + 'vh';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.animationDuration = (1 + Math.random() * 2) + 's';
    document.body.appendChild(star);
    stars.push(star);
}

let raveInterval = null;
let raveOn = false;
const body = document.body;
const texte = document.getElementById('texte-bienvenue');
const raveButton = document.getElementById('rave-button');
let particulesRave = [];

function toggleRaveMode() {
    if (!raveOn) {
        raveOn = true;
        raveButton.setAttribute('aria-pressed', 'true');
        raveButton.setAttribute('aria-label', 'Désactiver le mode rave');
        siteHeader.classList.add('rave-active');
        texte.classList.remove('bounce-normal');
        texte.classList.add('bounce-rainbow');

        stars.forEach(star => star.style.display = 'none');

        const couleurs = ['#ff6ec7', '#33ccff', '#ffff66', '#ff9966', '#cc66ff', '#66ff99'];
        const particleCount = reducedMotion.matches ? 0 : (compactExperience.matches ? 24 : 50);
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 15 + 10;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = Math.random() * window.innerHeight + 'px';
            particle.style.backgroundColor = couleurs[Math.floor(Math.random() * couleurs.length)];
            particle.style.animationDuration = (5 + Math.random() * 10) + 's';
            document.body.appendChild(particle);
            particulesRave.push(particle);
        }

        if (reducedMotion.matches) {
            body.style.background = 'linear-gradient(135deg, #7b2cff, #ff4fa3)';
            texte.style.color = '#fff36d';
        } else raveInterval = setInterval(() => {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            body.style.background = `rgb(${r}, ${g}, ${b})`;

            document.querySelectorAll("button").forEach(btn => {
            btn.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
            });

        }, 200);
    } else {
        raveOn = false;
        clearInterval(raveInterval);
        raveButton.setAttribute('aria-pressed', 'false');
        raveButton.setAttribute('aria-label', 'Activer le mode rave');
        siteHeader.classList.remove('rave-active');
        texte.classList.remove('bounce-rainbow');
        texte.classList.add('bounce-normal');
        texte.style.color = '';
        body.style.background = '';

        document.querySelectorAll("button").forEach(btn => {
            btn.style.backgroundColor = '';
        });

        particulesRave.forEach(p => p.remove());
        particulesRave = [];

        stars.forEach(star => star.style.display = 'block');
    }
}
