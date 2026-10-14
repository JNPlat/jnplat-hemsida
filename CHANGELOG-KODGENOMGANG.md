# Kodstädning – oktober 2026

## Kodstruktur
- Samlade de duplicerade funktionerna för tjänstenamn och HTML-escaping i `site-utils.js`.
- Uppdaterade tjänstesidorna och projektsidan så att de laddar den gemensamma hjälpfunktionen före sina egna skript.
- Behöll projektdata, innehåll, bildresurser och den befintliga sidstrukturen.
- Uppdaterade README med den nya filen och tydligare instruktioner för underhåll och publicering.

## CSS-städning
- Tog bort exakta duplicerade CSS-regelblock när selektor, deklarationer och media-query-kontext var identiska.
- Tog bort tomma CSS-regler/media-query-block och onödiga tomrader.
- Formaterade CSS-regler med konsekvent indrag och en deklaration per rad; kontrollerade att CSS-AST efter formatering är oförändrat.
- Bevarade ordningen för kvarvarande regler och deklarationer för att minska risken att ändra webbplatsens utseende.
- Lät avsiktliga breakpoint- och override-regler ligga kvar; att slå ihop dem utan visuell jämförelse skulle kunna ändra layouten.

## Automatiska kontroller
- JavaScript syntaxkontrollerad med `node --check` för alla `.js`-filer.
- `data/projects.json` kontrollerad som giltig JSON.
- CSS-filerna parsade utan syntaxfel, inklusive regler inuti media queries.
- Relativa HTML-resurssökvägar kontrollerade; inga saknade lokala resurser hittades.
- ZIP-arkivet kontrollerat efter skapande.

## Viktigt inför publicering
Ingen riktig webbläsare eller visuell regressionstestning kördes i denna miljö. Kontrollera därför startsida, tjänstesidor och projektgalleri på desktop och mobil innan publicering. Syntax- och sökvägskontroller bekräftar inte att layouten ser korrekt ut.
