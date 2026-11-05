# My-Portfolio

Personal portfolio — **Cybersecurity & IT Audit**.

Live: https://nanda-1-wq.github.io/My-Portfolio/

## Stack
Static HTML / CSS / vanilla JS (no build step, GitHub Pages friendly).

| File | Purpose |
|------|---------|
| `index.html` | Page structure & content |
| `style.css`  | Design tokens, dark theme, layout, motion |
| `script.js`  | Dependency-free interactions (nav, scroll effects, reveals) |

## Motion
Apple-style effects, all disabled automatically when the visitor prefers reduced motion:
- Frosted-glass sticky header
- Staggered blur-in hero intro and scroll-driven hero "recede"
- Scroll-lit statement text (word by word)
- Scroll-reveal with staggered groups
- Cursor-following spotlight on cards

## Editing content
- Skills: `#skills` section in `index.html` — plain `<li>` chips.
- Rotating role words: `data-words` on `.rotator` (pipe-separated).
- Contact form posts to FormSubmit; change the `action` URL to update the destination email.
