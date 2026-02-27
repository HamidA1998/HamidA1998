# AGENTS.md

## Cursor Cloud specific instructions

**Cosmic Touch** is a zero-dependency, single-file static web app (`index.html`). There are no build tools, package managers, linters, or test frameworks.

### Running the app

Serve the project root with any static file server:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html` in Chrome.

### Key caveats

- There is no build step, no lint command, and no automated test suite — the app is a single self-contained HTML file with inline CSS/JS.
- Mobile-specific features (gyroscope tilt, shake detection) require HTTPS and a real device; they cannot be tested in a desktop browser.
- The canvas animation loop runs via `requestAnimationFrame`; any change to `index.html` is picked up on a simple browser refresh.
