<div align="center">

# BIOVISION LAB

### Biology, visualized.

![BioVision Lab](https://img.shields.io/badge/BIOVISION_LAB-2026-%23F2F0EB?style=for-the-badge&labelColor=%23060608)
![Status](https://img.shields.io/badge/STATUS-LIVE-%237A1212?style=for-the-badge&labelColor=%23060608)
![Deps](https://img.shields.io/badge/DEPENDENCIES-ZERO-%23060608?style=for-the-badge&labelColor=%23060608)
![License](https://img.shields.io/badge/License-MIT-%23060608?style=for-the-badge&labelColor=%23060608)

An interactive virtual lab for biotechnology students — textbook topics
become living visual experiences.

[Live Demo](https://biovision-lab.vercel.app) • [GitHub](https://github.com/adityapratap0077-cloud/biovision-lab)

</div>

---

## The lab bench

### DNA Replication Fork
A step-through animated replication fork with **5 stages**, from helicase
loading at oriC through Okazaki fragment synthesis — enzyme highlights for
helicase, primase, DNA polymerase and ligase, each with its own function
explainer.

### Beating Heart
A beating human heart with a live blood-flow circuit animation and a BPM
slider (**40–160**, resting default 72), with the cardiac cycle paced to
your setting.

### Cell Explorer
A clickable animal cell: **9 organelles** — nucleus, mitochondria, rough and
smooth ER, Golgi apparatus, lysosome, ribosomes, vacuole, cell membrane —
each with its function and a fun fact.

### Quiz Mode
**12 questions** with instant feedback, explanations and best-score tracking
persisted in the browser.

## Tech

Zero dependencies. Pure HTML + CSS + JavaScript with Canvas and SVG —
static files that deploy anywhere in seconds.

---

## Getting started

```bash
git clone https://github.com/adityapratap0077-cloud/biovision-lab.git
cd biovision-lab
```

Open `index.html` in a browser, or serve statically:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Push to `main` — Vercel auto-deploys production.

---

## License

MIT © Aditya Pratap — see [LICENSE](LICENSE).

---

**Aditya Pratap** — Creative Technologist
Gorakhpur, India — github.com/adityapratap0077-cloud
