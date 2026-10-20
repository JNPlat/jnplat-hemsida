# J. Norberg Plåtslageri AB – webbplats

Statisk webbplats för J. Norberg Plåtslageri AB. Publiceras som statiska filer. Behåll mappstrukturen och relativa sökvägar.

## Snabbguide: vad vill du ändra?

| Jag vill ändra… | Börja här |
|---|---|
| Text, bilder eller sektioner på startsidan | `index.html` |
| Texten på en tjänstesida | Relevant fil i `tjanster/` |
| Vilka projekt som visas och deras beskrivningar | `data/projects.json` |
| Färger, typsnitt, avstånd, knappar, rubrikstorlekar och layoutlägen | `tokens.css` |
| Layout på startsidans sektioner | `style.css` |
| Utseende på tjänste- och projektsidor | `undersidor.css` |
| Header, logotyp, navigering och headerhöjd | `header.css` |
| Startsida: navigering | `script.js` |
| Mobilmenyn (stående skärm, alla sidor) | `menu.js` |
| Tjänstesidor: projektkort och bildgalleri | `service.js` |
| Projektdetaljsida och galleri | `project.js` |
| Gemensamma JavaScript-hjälpfunktioner | `site-utils.js` |

**Viktigt:** börja med rätt fil och sök efter den aktuella klassens namn innan du lägger till nya CSS-regler. Lägg inte till en ny override om en befintlig regel kan ändras på ett säkert sätt. Headerns mått ägs av `header.css`. Den gemensamma listan över tjänstenamn och tjänstesidornas sökvägar ägs av `site-utils.js`.

## Filstruktur

```text
jnplat-hemsida/
├── index.html
├── projekt.html
├── tokens.css
├── style.css
├── undersidor.css
├── header.css
├── menu.js
├── script.js
├── service.js
├── project.js
├── site-utils.js
├── data/
│   └── projects.json
├── tjanster/
│   ├── byggnadsplatslageri.html
│   ├── kopparslageri.html
│   ├── restaurering.html
│   └── specialprojekt.html
├── images/
├── logo/
├── project-template.json.txt
├── README.md
└── CHANGELOG-KODGENOMGANG.md
```

## Vad filerna gör

- `index.html` – startsidans innehåll och struktur.
- `tjanster/*.html` – innehåll och struktur för de fyra tjänstesidorna.
- `projekt.html?id=<projekt-id>` – gemensam projektdetaljsida.
- `tokens.css` – grunden från designsystem v1: färger, typsnitt, avstånd (8/16/24/40/64), knappar (`.btn`, `.btn--ghost`), överrubrik (`.eyebrow`), fluida textstorlekar och layoutlägen. Läses in först på varje sida.
- `style.css` – startsidans sektioner.
- `undersidor.css` – tjänste- och projektsidornas layout, projektkort och gallerier.
- `header.css` – gemensam header, navigering och sidornas header-offset.
- `menu.js` – mobilheaderns ringknapp och menyknapp samt helskärmsmenyn med tjänsterna som undermeny. Läses in på alla sidor (`data-base="../"` i undermappar).
- `script.js` – startsidans navigering (aktiv länk vid scroll).
- `service.js` – laddar projekt på tjänstesidorna och hanterar projektgalleriet.
- `project.js` – laddar projektdetaljer och bildgalleri.
- `site-utils.js` – gemensamma hjälpfunktioner för tjänstenamn och HTML-escaping.
- `data/projects.json` – projektinnehåll, bildsökvägar och publiceringsstatus.
- `project-template.json.txt` – exempel på ett projektobjekt att kopiera till projektlistan.
- `images/` och `logo/` – bilder, logotyp och ikoner.

## Responsiv struktur

Sajten har två layoutlägen som väljs efter skärmens **orientering**, inte efter pixelbredd:

- **Liggande** (`@media (orientation: landscape)`): text och bild bredvid varandra. Varje startsidesektion fyller exakt skärmen under headern (`min-height: var(--screen-h)`). Textstorlekar och avstånd skalas med skärmhöjden (`--fs-body`, `--fs-h1`, `--pad-v` m.fl. i `tokens.css`) så att innehållet ryms på en skärm.
- **Stående** (`@media (orientation: portrait)` eller som grundläge): bild över text, tjänsterna som svepbara kort.
- **Låg liggande skärm** (mobil på sidan, `max-height: 560px`): liggande layout med kompakt header (60 px). Sektionerna får växa i stället för att klippa text.

Header-höjden (`--header-height`) och sektionshöjden (`--screen-h`, byggd på `svh`) definieras bara i `tokens.css`. Bilder ligger absolut i sin ruta (`object-fit: cover`) och styr aldrig sektionens höjd. Lägg inte till nya pixelbrytpunkter för layout; `node scripts/validate-site.mjs` underkänner 800/810/801/811 px.

## Bildversioner för stående och liggande skärm

- **Herobilden** finns i två versioner: `images/hero-bild.webp` (bred, visas på stående skärm) och `images/hero-bild-liggande.webp` (nästan kvadratisk, visas på liggande skärm och dator). Byt mot egna versioner med samma filnamn.
- **Kontaktbilden** finns som `images/st-johannes.webp` (hög, stående skärm) och `images/st-johannes-bred.webp` (16:9, liggande skärm och dator).
- **Tjänstebilderna** finns som `*-desktop.webp` (hög) och `*-mobil.webp` (bred 16:9). Startsidans tjänstekort använder den breda versionen på mobil i liggande läge, tjänstesidornas toppbild använder alltid den breda.

## Citat (Mitt löfte) och meriter (John Norberg)

- **Citat** ligger under "De jag arbetar med" i sektionen `#loftet` i `index.html`. Det finns tre färdiga platser för konsult, plåtkonsult och antikvarie. Fyll i texten och ta bort ordet `hidden` så syns kortet. Fler citat läggs till genom att kopiera ett helt `figure`-block. Ett citat fyller bredden; fler läggs på rad och sveps eller scrollas.
- **Meriter** är en lista (`about-merits`) i sektionen `#om`. En `<li>` per merit.
- **Undersidornas textstorlekar** (tjänstesidor, projektsida, galleri) använder samma variabler som startsidan: `--fs-h1`, `--fs-h2`, `--fs-h3` och `--fs-body` i `tokens.css`.

Bildfilerna `*-desktop.webp` är höga (nästan kvadratiska) och används på startsidan i båda lägena. `*-mobil.webp` är breda 16:9 och används på tjänstesidornas hero.

## Typografi och design

Rubriker: Cormorant Garamond 600. Brödtext och knappar: Inter. Färger, radie (6 px) och avstånd kommer från designsystem v1. Undersidornas (`undersidor.css`) textstorlekar är fortfarande inte standardiserade mot den fluida skalan.

### Kända CSS-underhållspunkter

- `style.css` innehåller flera senare regler för samma väljare kring startsidans sektioner.
- `undersidor.css` har återkommande väljare och senare regler som påverkar tjänstesidornas utseende. Kontrollera regelordning och brytpunkter innan du slår ihop dem.
- `header.css` innehåller också överstyrningar, men äger avsiktligt headerns höjd, navigering och sidornas offset. Den filen ska inte städas genom att flytta regler till andra stilmallar.

Upprepade väljare är inte automatiskt fel: media queries och senare överstyrningar kan vara avsiktliga. Slå bara ihop eller ta bort regler efter att deras ordning, brytpunkter och visuella effekt har kontrollerats.

Färgvariabler och gemensamma designvärden finns i början av `style.css`. Där finns nu även namngivna variabler för utvalda brödtextstorlekar på startsidan och undersidorna. Ändra dessa värden för att justera de berörda textrollerna; kontrollera att mobilregler och specialrubriker fortsatt ska ha egna värden. Headerns gemensamma storlekar finns i `header.css`. Undvik att duplicera variabler i flera filer utan ett tydligt skäl.

## Lägg till eller ändra ett projekt

1. Lägg bilderna i en lämplig undermapp i `images/projekt/`.
2. Lägg till eller ändra projektobjektet i `data/projects.json`.
3. Använd ett unikt `id`.
4. `service` ska vara `byggnadsplatslageri`, `kopparslageri`, `restaurering` eller `specialprojekt`.
5. Skriv bildsökvägar relativt webbplatsens rot, exempelvis `images/projekt/nytt-projekt/1.jpg`.
6. Sätt `published` till `true` för att visa projektet och `false` för att dölja det.
7. Använd `project-template.json.txt` som mall och kopiera själva JSON-objektet, inte HTML-kommentaren längst ned i mallfilen.

## Grundkontroller före publicering

- Kör `node scripts/validate-site.mjs` för JavaScript-, JSON-, projektdata-, brytpunkts- och lokala sökvägskontroller.
- Kontrollera att `data/projects.json` är giltig JSON.
- Kontrollera att alla lokala `src`- och `href`-sökvägar pekar på befintliga filer.
- Kontrollera projektbilderna och att projekt med `published: false` inte visas.
- Testa startsida, alla tjänstesidor och projektdetaljsidan på både desktop och mobil.
- Kontrollera särskilt header, karuseller, bildgallerier och horisontell sidscrollning.

En lyckad syntaxkontroll ersätter inte visuell testning i en riktig webbläsare.

Tjänstesidornas och projektsidans brödtext använder `--fs-body` från `tokens.css`, samma som startsidan.
