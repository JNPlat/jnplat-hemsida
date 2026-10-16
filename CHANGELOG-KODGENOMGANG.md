# Kodstädning – oktober 2026

## Genomförda ändringar
- Samlade gemensamma hjälpfunktioner för tjänstenamn och HTML-escaping i `site-utils.js`.
- Tjänstesidorna och projektsidan laddar hjälpfunktionerna före respektive sidskript.
- Tog bort `project-band.js`, eftersom ingen HTML-sida laddade skriptet och dess projektbandskomponent inte förekom i sidornas markup.
- Tog bort oanvända CSS-regler och selector-grenar för `.project-bottom-band` och `.project-references-*`, som enbart tillhörde den borttagna komponenten.
- Tog bort favicon-filerna `favicon-180.png`, `favicon-192.png` och `favicon-48.png`, som inte refererades av webbplatsen; `favicon-180.png` var dessutom byte-identisk med `apple-touch-icon.png`.
- Rensade blanktecken och onödiga tomrader i CSS och dokumentation.
- Uppdaterade README med den faktiska filstrukturen, ansvarsområden och instruktioner för projektdata och testning.
- Bevarade sidornas befintliga layoutregler och ordning i övrigt för att begränsa risken för visuella regressioner.

## Kontroller
- Alla kvarvarande JavaScript-filer kontrollerades med `node --check`.
- `data/projects.json` parsades som giltig JSON.
- `style.css`, `undersidor.css` och `header.css` parsades utan CSS-syntaxfel.
- Relativa `src`- och `href`-referenser i HTML kontrollerades; inga saknade lokala resurser hittades.
- Bildsökvägarna i projektdata kontrollerades; inga saknade projektbilder hittades.
- ZIP-arkivet kontrollerades efter skapande.

## Begränsning
Ingen riktig webbläsare eller visuell regressionstestning kördes. Layouten behöver därför kontrolleras på desktop och mobil innan publicering. Automatiska syntax- och sökvägskontroller bekräftar inte att utseendet är identiskt.

CSS-regler som verkar överlappande har inte mass-slagits ihop: separata breakpoint- och override-regler kan vara avsiktliga och deras ordning kan påverka layouten.


## Headerjustering – 2026-10-14

- Tog bort länken **Hem** från navigationen på samtliga fyra tjänstesidor.
- Tog bort CSS-regler som enbart fanns för den borttagna länken.
- Säkrade vit text och vit pil på Kontakt-knappen vid hover med mus/pekdon på desktop.
- Behöll headerns befintliga `position: fixed`-lösning på mobil. Den håller redan headern kvar överst vid scroll och har tillhörande innehållsoffset; ingen extra sticky-regel behövdes.
- Ändrade inte storleken på Kontakt-knappen eller headerns textstorlek; det inväntar mobilbilden.


## Repo-inventering – 2026-10-16

- Skapade arbetsgrenen `chore/repo-cleanup` från den fungerande `main`-versionen.
- Förtydligade README med en snabbguide för vanliga ändringar och tydliga filansvar.
- Identifierade `projects.json` i rotmappen som en tom JSON-array. Projektdata läses från `data/projects.json`; inga aktiva HTML- eller JavaScript-referenser till rotfilen hittades.
- Behöll `project-template.json.txt`: den är en användbar mall för att lägga till projekt.
- Typografins standardisering återstår som separat steg efter inventeringen, för att undvika oavsiktliga visuella ändringar.
