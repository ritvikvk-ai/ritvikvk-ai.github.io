# ritvikvk-ai.github.io

Personal site of Ritvik Vasantha Kumar: AI Engineer, MS CS @ NYU Tandon.

Static site, no build step. Open `index.html` or serve the folder:

```sh
python3 -m http.server 8000
```

## Layout

- `index.html` — page markup
- `assets/css/style.css` — styles
- `assets/js/data.js` — **content** (skills, projects, education); edit this to update the site
- `assets/js/visuals.js` — canvas visuals (LiDAR, particle name, CV demo, project thumbnails)
- `assets/js/hero.js` — hero background options; choose with `data-hero` on `<html>` (flow, terrain, net, swarm, lidar) or preview with `?hero=…`
- `assets/js/panels.js` — hero console panels (vision, pipeline, editor, system, tabs); choose with `data-panel` on `<html>` or preview with `?panel=…`. Numbers in the panels are illustrative.
- `assets/js/main.js` — animations and interactions (boot, smooth scroll, scroll triggers, cursor, ⌘K menu, terminal)
- `assets/vendor/` — GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13 (vendored, no CDN dependency)

Respects `prefers-reduced-motion`, and the content stays readable if JS libraries fail to load.
