# Kodgenomgång – etapp 2, oktober 2026

## Åtgärder
- Tog bort äldre, tomma header-overrideblock som blivit kvar efter tidigare justeringar.
- Tog bort flera historiska toppavståndsregler från `style.css` och `undersidor.css`; dessa ska nu styras av `header.css`.
- Tog bort de sista samlade header-overrideblocken i båda innehålls-CSS-filerna.
- Lät `header.css` äga headerns fasta höjd, logotypmått, navigeringsavstånd, sidornas toppoffset och sektionernas scrollmarginal.
- Komprimerade mobilheadern från 128 px till 118 px och logotypytan från 82 px till 74 px; måtten är gemensamma för alla sidor på mobil.
- Tog bort JavaScript som skrev över CSS-variabeln `--header-height` vid laddning och resize. JavaScript använder fortfarande den faktiska headerhöjden för ankarnavigering.
- Uppdaterade README så att ansvarsfördelningen mellan filerna är tydlig.

## Viktig avgränsning
Detta är en strukturell städning med fokus på headerkonflikter. Tjänstesidornas hero- och karusellregler har inte skrivits om i sin helhet eftersom de påverkar utseendet och bör jämföras visuellt mot nuvarande version.

## Kontroller
- CSS-syntax kontrolleras efter ändring.
- Alla HTML-sidor ska fortsatt länka `header.css` efter sidornas övriga stylesheets.
- Länkar och lokala resurssökvägar kontrolleras automatiskt.
- Visuellt test i en riktig mobilwebbläsare behöver fortfarande göras innan publicering; ingen kodändring bör betraktas som visuellt godkänd enbart från statisk kontroll.
