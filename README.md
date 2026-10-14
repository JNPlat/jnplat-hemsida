# J. Norberg Plåtslageri AB – webbplats

Statisk webbplats för J. Norberg Plåtslageri AB. Behåll mappstrukturen och relativa sökvägar när webbplatsen publiceras.

## Filstruktur

```text
jnplat-hemsida-main/
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
└── logo/
```

## Vad filerna gör

- `index.html` – startsida.
- `tjanster/*.html` – fyra tjänstesidor.
- `projekt.html?id=<projekt-id>` – gemensam projektdetaljsida.
- `style.css` – startsidans och webbplatsens visuella komponenter.
- `undersidor.css` – tjänste- och projektsidornas layout, projektkort och gallerier.
- `header.css` – gemensam header, navigering och sidornas header-offset.
- `script.js` – startsidans navigering och referenskarusell.
- `service.js` – laddar publicerade projekt på tjänstesidorna och hanterar projektgalleriet.
- `project.js` – laddar projektdetaljer och bildgalleri.
- `site-utils.js` – gemensamma hjälpfunktioner för tjänstenamn och HTML-escaping.
- `data/projects.json` – projektinnehåll, bildsökvägar och publiceringsstatus.

## CSS-ansvar

- `header.css` äger headerns placering och mått. Den laddas efter de andra lokala CSS-filerna.
- `style.css` äger startsidans visuella komponenter.
- `undersidor.css` äger tjänste- och projektsidornas layout.

Regler i olika media queries eller senare override-block ska inte slås ihop utan visuell kontroll. Ordningen i CSS kan påverka utseendet även när selektorerna verkar lika.

## Lägg till eller ändra ett projekt

1. Lägg bilderna i en lämplig undermapp i `images/`.
2. Lägg till eller ändra projektobjektet i `data/projects.json`.
3. Använd ett unikt `id`.
4. `service` ska vara `byggnadsplatslageri`, `kopparslageri`, `restaurering` eller `specialprojekt`.
5. Skriv bildsökvägar relativt webbplatsens rot, exempelvis `images/st-johannes.webp`.
6. Sätt `published` till `true` för att visa projektet. `false` döljer det.

Exempel:

```json
{
  "id": "villa-bergabo",
  "title": "Villa Bergabo",
  "service": "restaurering",
  "description": "Kort presentation av arbetet.",
  "longDescription": "Valfri längre projektbeskrivning.",
  "hero": "images/villa-bergabo.webp",
  "gallery": [
    "images/villa-bergabo.webp"
  ],
  "published": true
}
```

Öppna projektet via `projekt.html?id=villa-bergabo`. Om en hero-bild inte finns med i galleriet läggs den till automatiskt av projektskriptet.

## Kontroller före publicering

- Kontrollera JavaScript med `node --check` för varje `.js`-fil.
- Kontrollera att `data/projects.json` är giltig JSON.
- Testa webbplatsen via en lokal webbserver, särskilt eftersom sidorna hämtar projektdata med `fetch()`. Att öppna HTML direkt via `file://` kan blockera hämtningen.
- Testa startsida, samtliga tjänstesidor och projektsidan på desktop och mobil.
- Kontrollera att navigering, ankarlänkar, karuseller och bildgallerier fungerar.
- Kontrollera att bilder laddas och att sidan inte får horisontell overflow på smala skärmar.

Automatiska syntaxkontroller ersätter inte ett visuellt test i en riktig webbläsare.

## Publicering

Ladda upp innehållet i den här mappen till webbhotellets webbrot. Behåll mappnamnen och relativa sökvägar. Peka därefter domänen `jnplat.se` mot webbhotellet enligt leverantörens instruktioner.
