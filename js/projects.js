function createExternalLink(label, url, className) {
    const link = document.createElement('a');
    link.className = `project-link ${className}`;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    return link;
}

function hasProjectLink(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function getProjectTilt(index) {
    return index % 2 === 0 ? '-1.5deg' : '1.5deg';
}

function fillProjectFallback(visual, project) {
    visual.replaceChildren();
    visual.classList.add('project-visual-fallback');
    visual.setAttribute('aria-hidden', 'true');

    const ticket = document.createElement('div');
    ticket.className = 'cinema-ticket';

    const ticketLabel = document.createElement('span');
    ticketLabel.className = 'cinema-ticket-label';
    ticketLabel.textContent = 'SUPER FILM CLUB';

    const projectName = document.createElement('strong');
    projectName.textContent = project.name;

    const ticketCode = document.createElement('span');
    ticketCode.className = 'cinema-ticket-code';
    ticketCode.textContent = '🎬  ★  🍿';

    ticket.append(ticketLabel, projectName, ticketCode);
    visual.appendChild(ticket);

    for (let index = 0; index < 5; index++) {
        const capsule = document.createElement('span');
        capsule.className = `gacha-capsule capsule-${index + 1}`;
        visual.appendChild(capsule);
    }
}

function createProjectVisual(project, dataUrl) {
    const visual = document.createElement('div');
    visual.className = 'project-visual';

    if (project.image) {
        const image = document.createElement('img');
        image.src = new URL(project.image, dataUrl).href;
        image.alt = `Aperçu de ${project.name}`;
        image.loading = 'lazy';
        image.addEventListener('error', () => fillProjectFallback(visual, project), { once: true });
        visual.appendChild(image);
        return visual;
    }

    fillProjectFallback(visual, project);
    return visual;
}

function createProjectCard(project, index, dataUrl) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.style.setProperty('--project-tilt', getProjectTilt(index));

    const visual = createProjectVisual(project, dataUrl);
    const copy = document.createElement('div');
    copy.className = 'project-copy';

    const kicker = document.createElement('p');
    kicker.className = 'project-kicker';
    kicker.textContent = `projet n°${String(index + 1).padStart(2, '0')}`;

    const title = document.createElement('h2');
    title.textContent = project.name;

    const description = document.createElement('p');
    description.className = 'project-description';
    description.textContent = project.description;

    const links = [];
    if (hasProjectLink(project.url)) {
        links.push(createExternalLink('voir le projet ↗', project.url.trim(), 'project-link-primary'));
    }
    if (hasProjectLink(project.githubUrl)) {
        links.push(createExternalLink('github ↗', project.githubUrl.trim(), 'project-link-secondary'));
    }

    copy.append(kicker, title, description);
    if (links.length > 0) {
        const actions = document.createElement('div');
        actions.className = 'project-actions';
        actions.append(...links);
        copy.appendChild(actions);
    }
    card.append(visual, copy);
    return card;
}

function isValidProject(project) {
    if (!project || typeof project !== 'object') return false;

    const requiredFields = ['name', 'description'];
    return requiredFields.every(field => typeof project[field] === 'string' && project[field].trim());
}

function showProjectsMessage(projectsGrid, message, isError = false) {
    const paragraph = document.createElement('p');
    paragraph.className = `projects-message${isError ? ' projects-message-error' : ''}`;
    paragraph.textContent = message;
    projectsGrid.replaceChildren(paragraph);
}

async function loadProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    const source = projectsGrid.dataset.source;
    if (!source) {
        showProjectsMessage(projectsGrid, 'aucune source json configurée.', true);
        return;
    }

    projectsGrid.setAttribute('aria-busy', 'true');
    showProjectsMessage(projectsGrid, 'chargement des projets…');

    try {
        const dataUrl = new URL(source, window.location.href);
        const response = await fetch(dataUrl);
        if (!response.ok) {
            throw new Error(`Réponse HTTP ${response.status}`);
        }

        const projects = await response.json();
        if (!Array.isArray(projects)) {
            throw new TypeError('Le fichier projects.json doit contenir une liste.');
        }

        const validProjects = projects.filter(isValidProject);
        if (validProjects.length === 0) {
            showProjectsMessage(projectsGrid, 'aucun projet valide pour le moment.');
            return;
        }

        const fragment = document.createDocumentFragment();
        validProjects.forEach((project, index) => {
            fragment.appendChild(createProjectCard(project, index, dataUrl));
        });

        projectsGrid.replaceChildren(fragment);
    } catch (error) {
        const message = window.location.protocol === 'file:'
            ? 'ouvre le site avec un serveur local pour charger projects.json.'
            : 'impossible de charger les projets pour le moment.';
        showProjectsMessage(projectsGrid, message, true);
        console.warn('Impossible de charger les projets :', error);
    } finally {
        projectsGrid.removeAttribute('aria-busy');
    }
}

loadProjects();
