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


## Typografiska variabler – 2026-10-16

- Lade till namngivna CSS-variabler för utvalda brödtextstorlekar på startsidan och undersidorna.
- Kopplade hero-ingress, tjänstekortens brödtext och vanliga brödtextregler på undersidorna till dessa variabler.
- Behöll nuvarande pixelvärden för att inte ändra utseendet avsiktligt i detta steg.
- Rubriker, knappar, små etiketter och många specialkomponenter har fortfarande separata värden; detta är ett första kontrollerat steg, inte en fullständig typografisk omarbetning.
- Ändringarna är statiskt kontrollerade mot de aktuella CSS-reglerna; ingen webbläsarbaserad visuell regressionstestning är gjord.

## CSS-granskning av undersidor – 2026-10-16

- Tog bort en tom `@media (max-width:800px)`-regel i `undersidor.css`; den innehöll inga deklarationer och kunde inte påverka layouten.
- Kartlade upprepade selektorer. Tjänstehero och projektkarusell har många senare regler som avsiktligt eller historiskt skriver över tidigare deklarationer, ofta med `!important`.
- Lät dessa regler vara orörda i detta steg. Att slå ihop dem utan webbläsarbaserad kontroll riskerar att ändra den fungerande desktop- eller mobilayouten.
- Ingen visuell webbläsartestning har utförts; ändringen är en begränsad, statisk städning.
- Tog bort en oanvänd variabel för mobil brödtext; den hade ingen CSS-regel som använde den.


## Responsiv refaktorering och validering – 2026-10-16

- Tog bort de separata desktopreglerna vid 1150 px i startsidans CSS och headern samt 1100 px på undersidorna.
- Tog även bort den extra 460 px-brytpunkt som tidigare växlade projektkorten till en kolumn. Mobilens projektgrid använder nu `auto-fit` med en minsta kortbredd på 190 px, så antalet kolumner anpassas flytande inom samma mobil-/surfplatteläge.
- Ersatte stegvisa mått med flytande CSS-värden där det gick att bevara samma grundlayout.
- Behöll två övergripande layoutlägen: mobil/surfplatta till och med 810 px och desktop från 811 px. Mindre mobiljusteringar och särskilda regler för höjd eller pekdon finns kvar där de fyller en separat funktion.
- Samlade tjänstenamn och tjänstesidornas sökvägar i `site-utils.js`, så `project.js` inte behöver en separat kopia av tjänstekonfigurationen.
- Utökade `scripts/validate-site.mjs` med kontroller av projektdata, unika projekt-ID:n, tillåtna tjänstekategorier, befintliga projektbilder, CSS-klamrar, lokala sökvägar och skriptens laddningsordning.
- Lade till kontroll av att tjänstesidornas sökvägar i den gemensamma konfigurationen finns och att startsidans karusell använder samma layoutgräns som headern.

### Kontroller och begränsningar

- GitHub Actions-valideringen passerar för den version som senast kontrollerades.
- En extern byggkontroll för publiceringsplattformen rapporterade fel; orsaken är ännu inte verifierad och ska inte antas vara ett kodfel eller ett konfigurationsfel utan att granska loggarna.
- Ingen visuell webbläsartestning har utförts. De responsiva CSS-ändringarna behöver därför verifieras i en riktig webbläsare innan de betraktas som färdiggranskade.

## Konsolidering av desktopkarusellens CSS – 2026-10-16

- Slog ihop två intilliggande desktopregler för tjänstesidornas projektkarusell till en regeluppsättning.
- Tog bort motstridiga mellanvärden för pilarnas höjd och justering som omedelbart skrevs över av nästa regel; den slutliga layouten behålls uttryckligen: pilarna sträcker sig med karusellraden.
- Behöll övriga deklarationer som styr gridkolumner, mellanrum och karusellens innehåll.
- Detta är en CSS-kaskadstädning utifrån deklarationsordningen, inte en visuell verifiering. Webbläsartestning återstår.

## Konsolidering av mobilens referenskarusell – 2026-10-16

- Tog bort en tidigare mobilregeluppsättning för referenskarusellen som skrevs över av den senare slutliga lösningen för svepning.
- Behöll den sista regeln som styr mobilens horisontella svep, kortbredd, inre sidmarginaler och dolda pilar.
- Syftet är att minska mängden CSS som ser aktiv ut men inte längre styr slutresultatet. Ingen visuell webbläsartestning har utförts, så ändringen är ännu inte visuellt verifierad.

## Ytterligare konsolidering av referenskarusellen – 2026-10-16

- Tog bort en äldre desktopregeluppsättning som lade pilar ovanpå korten och skapade extra sidpadding i viewporten.
- Behöll den senare regeluppsättningen där pilarna ligger i egna gridkolumner och viewporten/kortspåret styrs separat. Den kant-till-kant-regeln för referensbandet är kvar.
- Automatisk validering körs på den nya committen. Visuell kontroll i webbläsare återstår.
