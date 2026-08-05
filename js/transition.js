(() => {
    const STORAGE_KEY = 'sitecool:vortex-arrival';
    const html = document.documentElement;
    const body = document.body;
    const overlay = document.getElementById('vortex-transition');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const arrivalDirection = html.dataset.vortexArrival;
    const VORTEX_SOUND_VOLUME = 0.72;
    const MUSIC_DUCK_VOLUME = 0.06;
    let navigationTimer = null;

    function normalizePath(pathname) {
        const trimmedPath = pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
        return `${trimmedPath || ''}/`;
    }

    function useCanonicalWebPath(destination) {
        if (destination.protocol === 'http:' || destination.protocol === 'https:') {
            destination.pathname = destination.pathname.replace(/\/index\.html$/, '/');
        }

        return destination;
    }

    function clearTransitionState() {
        body.classList.remove('is-transitioning', 'vortex-leaving', 'vortex-arriving');
        html.removeAttribute('data-vortex-arrival');
    }

    function fadeOutMusic(duration) {
        const music = document.getElementById('musique');
        if (!music || music.paused) return;

        const initialVolume = Math.min(music.volume, MUSIC_DUCK_VOLUME);
        const startedAt = performance.now();
        music.volume = initialVolume;

        function fadeFrame(now) {
            const progress = Math.min((now - startedAt) / duration, 1);
            music.volume = initialVolume * (1 - progress);

            if (progress < 1 && body.classList.contains('is-transitioning')) {
                requestAnimationFrame(fadeFrame);
                return;
            }

            music.pause();
        }

        requestAnimationFrame(fadeFrame);
    }

    function playVortexSound() {
        const vortexSound = document.getElementById('vortex-sound');
        if (!vortexSound) return;

        vortexSound.pause();
        vortexSound.currentTime = 0;
        vortexSound.volume = VORTEX_SOUND_VOLUME;
        vortexSound.playbackRate = 1.6;
        vortexSound.play().catch(() => {
            // La transition visuelle reste fonctionnelle si l’audio est bloqué.
        });
    }

    function storeArrival(destination, direction) {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                to: normalizePath(destination.pathname),
                direction,
                createdAt: Date.now()
            }));
        } catch (error) {
            // La navigation reste fonctionnelle si le stockage est indisponible.
        }
    }

    function shouldHandleLink(event, link) {
        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            link.target === '_blank' ||
            link.hasAttribute('download')
        ) {
            return false;
        }

        const destination = new URL(link.href, window.location.href);
        return destination.origin === window.location.origin &&
            normalizePath(destination.pathname) !== normalizePath(window.location.pathname);
    }

    function startNavigation(event) {
        const link = event.currentTarget;
        if (!shouldHandleLink(event, link) || body.classList.contains('is-transitioning')) return;

        event.preventDefault();

        const destination = useCanonicalWebPath(new URL(link.href, window.location.href));
        const direction = normalizePath(destination.pathname).startsWith('/projets/')
            || normalizePath(destination.pathname).endsWith('/projets/')
            ? 'to-projects'
            : 'to-home';
        const duration = reducedMotion.matches ? 220 : 1250;

        storeArrival(destination, direction);
        body.classList.add('is-transitioning', 'vortex-leaving');
        overlay?.setAttribute('aria-hidden', 'false');
        fadeOutMusic(duration * 0.78);
        playVortexSound();

        navigationTimer = window.setTimeout(() => {
            window.location.assign(destination.href);
        }, duration);
    }

    document.querySelectorAll('[data-vortex-link]').forEach(link => {
        link.addEventListener('click', startNavigation);
    });

    if (arrivalDirection) {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            // Rien à nettoyer si le stockage est indisponible.
        }

        body.classList.add('is-transitioning', 'vortex-arriving');
        overlay?.setAttribute('aria-hidden', 'false');

        window.setTimeout(() => {
            clearTransitionState();
            overlay?.setAttribute('aria-hidden', 'true');
        }, reducedMotion.matches ? 220 : 1200);
    }

    window.addEventListener('pageshow', event => {
        if (!event.persisted) return;

        if (navigationTimer) {
            window.clearTimeout(navigationTimer);
            navigationTimer = null;
        }

        clearTransitionState();
        overlay?.setAttribute('aria-hidden', 'true');

        const music = document.getElementById('musique');
        const soundToggle = document.getElementById('sound-toggle');
        if (music && soundToggle) {
            music.pause();
            music.volume = 1;
            music.muted = true;
            soundToggle.textContent = '🔇';
            soundToggle.setAttribute('aria-pressed', 'true');
            soundToggle.setAttribute('aria-label', 'Lancer la musique');
            soundToggle.title = 'Lancer la musique';
        }
    });
})();
