# Intiyaj Ansari — Developer Portfolio

Monochrome editorial portfolio for **Intiyaj Ansari**, MERN Stack & WordPress Developer.
Content is built from the resume (`assets/Intiyaj-Ansari-Resume.pdf`).

## Sections

| Section | Content |
|---|---|
| Home | Name, B.Tech CSE 2027, pitch, quick links to Frontend / Backend / Full-Stack |
| About Me | Scroll-expand card: summary, stack, Resume + Get in touch buttons |
| Experience | Horizontal timeline: education intro + OctaNet, CODTECH, Inforag, Springer Capital |
| Projects | Carousel: ShopBag, Nestivo, iNotebook, Online (live + GitHub links in the modal) |
| Tech Stack | 3D wheel: Languages, Frontend, Backend, Database, Tools & Deployment |
| What I Do | Accordion: Frontend, Backend & Database, Full-Stack & WordPress |
| Contact | Footer links + contact form (opens your email app addressed to intiyajansari8757@gmail.com) |

## Where to edit things

- **Experience chapters** → `index.html`, section `#experience` (one `.exp-panel` per role; add `data-phase`, and a matching `.exp-jump-btn` with `data-panel-index`). Section height / stage width scale with the number of chapters.
- **Projects (carousel)** → `DEFAULT_ITEMS` in `flex-carousel.js`
- **Tech stack (wheel)** → `DEFAULT_WORKS` in `works-wheel.js`
- **Images** → `Project Images/` and `Skill Images/` (currently generated placeholders — replace the project ones with real screenshots, keeping the same file names or updating the paths in `flex-carousel.js`)
- **Your photo** → replace `assets/hero_portrait.png` (384×512, dark subject on white works best with the fade mask)

## Run locally

```bash
npm start        # python3 -m http.server 8080
```

Open http://localhost:8080. Tailwind (CDN) and Google Fonts need an internet connection.
