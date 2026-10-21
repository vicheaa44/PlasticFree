# Responsible AI usage log

Infomatrix asks Software Development entrants to *"cite all prompts, models, or AI resources used and give proper credit in their documentation and presentation."* This file is that citation: what was used, the prompts, what the AI produced, and how a human checked it.

## Tool and model

| | |
|---|---|
| Tool | [Claude Code](https://claude.com/claude-code), Anthropic's AI coding assistant (desktop app) |
| Model | Claude Sonnet 5.5 (`claude-sonnet-5-5`), Anthropic |
| Role | Pair programmer: wrote code, tests, translations and documentation from the student's instructions |
| Not used | No AI-generated images. The isometric illustrations are drawn in code. Statistics come from UNEP, Eurostat and others, the chart from Our World in Data, the video from TEDxDelft, the map data from OpenStreetMap. |

## Prompts

The student's prompts, as typed (spelling kept; a GitHub e-mail address is left out):

1. > hey hey inca un site despre :
   >
   > „PlasticFree” – plasticul din oceane (ODD 14)
   > Problema: în fiecare an ajung în oceane milioane de tone de plastic, iar până în 2050 ar putea fi mai mult plastic decât pește (ca greutate). E una dintre cele mai cunoscute campanii ONU (#BeatPlasticPollution).
   > Ce face site-ul:
   >
   > 1. Calculator de amprentă plastic: răspunzi la câteva întrebări (sticle, pungi, ambalaje) și afli câți kg de plastic produci pe an.
   > 2. „Schimbă-l cu”: alegi un produs din plastic, iar site-ul îți arată alternativa, cât costă și cât plastic economisești.
   > 3. Simulare ocean: o animație în care oceanul se umple sau se curăță în funcție de alegerile tale.
   > 4. Provocarea 30 de zile fără plastic: un checklist zilnic și un contor cu plasticul economisit.
   > 5. Hartă: puncte de reciclare și magazine vrac din oraș.
   >
   > Aceiaasi structura ca la climawatch si WasteLand dar doresc NavBarul sa fie pe Stanga
   > Siteul trebuie sa contina asa design: https://deepbook-v2-wip.webflow.io (la fel si culorile )

2. > inainte sa stii ca fac de pe alkt account de github

3. > username: *(GitHub username)*
   > gmail: *(e-mail)*
   >
   > nam creat inca niciun repo dai tu bataie

## What the AI did with them

| Prompt | Output |
|---|---|
| 1 | Read the student's two earlier projects (ClimaWatch and WasteLand) and mirrored their structure: Problem and Solution pages, interactive tools, an About page, English / Romanian / Russian, tests. Studied the reference site's visual language (palette `#000` / `#1b1b1b` / `#1e6ef3`, tight tracking, split "stack" panel, stat tiles, blue footer with a giant wordmark) without copying its code, images or its commercial font. Moved the navigation to a fixed left panel with a mobile drawer. Designed and wrote the five tools and the shared state, 51 tests, the translations and this documentation. Verified the statistics and every source link; looked up the OpenStreetMap tags and tested the Overpass servers. |
| 2 and 3 | Set up a new, separate Git repository with the commit name and e-mail of the account the student named, instead of reusing the existing one. |

## Human oversight

- Every product decision came from the student: the topic and its five tools, the requirement to follow ClimaWatch's and WasteLand's structure, the left-hand navigation, the reference design and the account to publish under.
- The code is run, not just generated. Automated tests (`npm test`), a TypeScript build (`npm run build`) and a linter (`npm run lint`) are run; every page was opened in a real browser on desktop and at phone width, and the map was tested against live OpenStreetMap servers. Problems found that way were fixed before release and are listed in the README (for example the map tiles that required an API key and the canvases that blanked with reduced motion).
- Every statistic links to its source. The calculator lists its weights and formula in the interface, and the About page lists the limits.
- Swap prices and per-item weights are estimates and are labelled as such; the ocean is described as a stylised model, not a measurement.

## Reproducing the process

```bash
npm install
npm test        # 51 tests
npm run lint
npm run build
npm run dev     # http://localhost:5173
```

The Git history shows each step of the work.
