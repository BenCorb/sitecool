# SiteCool

This site shows a playful landing page with optional background music controlled by a floating play/pause button, bouncing welcome text, and a rave mode button. It adds a custom banana cursor, confetti bursts on click, twinkling stars, floating particles, and dynamic color changes.

https://bencorb.com

## Lancer le site en local

Les projets sont chargés depuis `data/projects.json`, le site doit donc être servi en HTTP :

```bash
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000.

## Ajouter un projet

Les projets sont définis dans `data/projects.json`. Seuls `name` et `description` sont obligatoires ; `url`, `githubUrl` et `image` peuvent être omis, définis à `null` ou laissés vides.
