# J. Norberg Plåtslageri AB – webbplats

Statisk webbplats för J. Norberg Plåtslageri AB. Publiceras som statiska filer. Behåll mappstrukturen och relativa sökvägar.

## Snabbguide: vad vill du ändra?

| Jag vill ändra… | Börja här |
|---|---|
| Text, bilder eller sektioner på startsidan | `index.html` |
| Texten på en tjänstesida | Relevant fil i `tjanster/` |
| Vilka projekt som visas och deras beskrivningar | `data/projects.json` |
| Typsnitt, storlekar, färger och layout på startsidan | `style.css` |
| Utseende på tjänste- och projektsidor | `undersidor.css` |
| Header, logotyp, navigering och headerhöjd | `header.css` |
| Startsida: navigering och referenskarusell | `script.js` |
| Tjänstesidor: projektkort och bildgalleri | `service.js` |
| Projektdetaljsida och galleri | `project.js` |
| Gemensamma JavaScript-hjälpfunktioner | `site-utils.js` |

**Viktigt:** börja med rätt fil och sök efter den aktuella klassens namn innan du lägger till nya CSS-regler. Lägg inte till en ny override om en befintlig regel kan ändras på ett säkert sätt. Headerns mått ägs av `header.css`.

## Filstruktur

```text
jnplat-hemsida/
├── index.html
├── projekt.html
├── style.css
├── undersidor.css
├── header.css
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
- `style.css` – startsidans och webbplatsens visuella komponenter.
- `undersidor.css` – tjänste- och projektsidornas layout, projektkort och gallerier.
- `header.css` – gemensam header, navigering och sidornas header-offset.
- `script.js` – startsidans navigering och referenskarusell.
- `service.js` – laddar projekt på tjänstesidorna och hanterar projektgalleriet.
- `project.js` – laddar projektdetaljer och bildgalleri.
- `site-utils.js` – gemensamma hjälpfunktioner för tjänstenamn och HTML-escaping.
- `data/projects.json` – projektinnehåll, bildsökvägar och publiceringsstatus.
- `project-template.json.txt` – exempel på ett projektobjekt att kopiera till projektlistan.
- `images/` och `logo/` – bilder, logotyp och ikoner.

## Typografi och design

Typografin är ännu inte helt standardiserad mellan startsidan och undersidorna. Nuvarande utgångspunkter i koden är bland annat:

- Startsidan: ingress i heron 20 px på desktop; tjänstekortens brödtext 18 px på desktop och 17 px i mobilregler.
- Tjänste-/projektsidor: vanlig introduktionstext har en grundregel på 16 px, men den aktiva tjänstesidans senare regel sätter brödtexten i `.service-copy` till 15 px med `!important`.
- Ingressar, huvudrubriker, korttitlar, små etiketter och knappar har separata storleksregler och ska inte behandlas som vanlig brödtext.

Detta är en karta över nuläget, inte en rekommendation att behålla alla värden. Innan vi ändrar storlekarna ska vi besluta en gemensam skala och sedan uppdatera rätt regler på desktop och mobil. Ändra inte alla storlekar i ett svep: vissa element behöver egna proportioner.

### Kända CSS-underhållspunkter

- `style.css` innehåller flera senare regler för samma väljare, särskilt runt referenskarusellen och startsidans sektioner.
- `undersidor.css` har många återkommande väljare och `!important`-regler. Tjänstesidornas utseende påverkas delvis av senare regler långt ned i filen.
- `header.css` innehåller också överstyrningar, men äger avsiktligt headerns höjd, navigering och sidornas offset. Den filen ska inte städas genom att flytta regler till andra stilmallar.

Upprepade väljare är inte automatiskt fel: media queries och senare överstyrningar kan vara avsiktliga. Slå bara ihop eller ta bort regler efter att deras ordning, brytpunkter och visuella effekt har kontrollerats.

Färgvariabler och gemensamma designvärden finns i början av `style.css`. Headerns gemensamma storlekar finns i `header.css`. Undvik att duplicera variabler i flera filer utan ett tydligt skäl.

## Lägg till eller ändra ett projekt

1. Lägg bilderna i en lämplig undermapp i `images/projekt/`.
2. Lägg till eller ändra projektobjektet i `data/projects.json`.
3. Använd ett unikt `id`.
4. `service` ska vara `byggnadsplatslageri`, `kopparslageri`, `restaurering` eller `specialprojekt`.
5. Skriv bildsökvägar relativt webbplatsens rot, exempelvis `images/projekt/nytt-projekt/1.jpg`.
6. Sätt `published` till `true` för att visa projektet och `false` för att dölja det.
7. Använd `project-template.json.txt` som mall och kopiera själva JSON-objektet, inte HTML-kommentaren längst ned i mallfilen.

## Grundkontroller före publicering

- Kontrollera att `data/projects.json` är giltig JSON.
- Kontrollera att alla lokala `src`- och `href`-sökvägar pekar på befintliga filer.
- Kontrollera projektbilderna och att projekt med `published: false` inte visas.
- Testa startsida, alla tjänstesidor och projektdetaljsidan på både desktop och mobil.
- Kontrollera särskilt header, karuseller, bildgallerier och horisontell sidscrollning.

En lyckad syntaxkontroll ersätter inte visuell testning i en riktig webbläsare.
