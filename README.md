# JNPlåt – hemsida

Hemsida för J. Norberg Plåtslageri AB.

## Struktur

- `index.html` – startsida
- `style.css` – design och responsiv layout
- `script.js` – navigation, aktiv sektion och referenskarusell
- `logo/` – företagets logotyper
- `images/` – optimerade projekt- och verksamhetsbilder

## Nästa steg

1. Byt ut bildplatshållarna mot riktiga projektbilder när de är klara.
2. Lägg till telefonnummer och eventuella företagsuppgifter.
3. Bygg undersidor vid behov.
4. Koppla GitHub-repot till Cloudflare.
5. Koppla `jnplat.se`.

## Tjänste- och projektsidor

- `tjanster/byggnadsplatslageri.html`, `tjanster/kopparslageri.html`, `tjanster/restaurering.html` och `tjanster/specialprojekt.html` är tjänsternas egna sidor.
- `projekt.html?id=projektets-id` är den gemensamma projektsidemallen.
- `data/projects.json` styr vilka projekt som visas. Projekt med `"published": false` är utkast och visas inte.
- `service.js` visar automatiskt publicerade projekt på rätt tjänstesida.
- `project.js` fyller projektsidan och sköter bildgalleriets förstoring.

### Lägg till ett projekt

1. Lägg hero-bilden och galleribilderna i `images/projekt/`.
2. Lägg till ett objekt i `data/projects.json` med ett unikt `id`, `title`, `service`, `description`, `hero`, `gallery` och `published: true`.
3. `service` ska vara ett av `byggnadsplatslageri`, `kopparslageri`, `restaurering` eller `specialprojekt`.
4. Sökvägar i JSON anges från projektets rot, till exempel `images/projekt/villa-bergabo-hero.webp`.
5. Öppna projektsidan via `projekt.html?id=villa-bergabo` (där `id` matchar projektobjektet).

Exempel på ett projektobjekt:

```json
{
  "id": "villa-bergabo",
  "title": "Villa Bergabo",
  "service": "restaurering",
  "description": "Kort presentation av arbetet.",
  "longDescription": "Valfri längre projektbeskrivning.",
  "hero": "images/projekt/villa-bergabo-hero.webp",
  "gallery": [
    "images/projekt/villa-bergabo-01.webp",
    "images/projekt/villa-bergabo-02.webp"
  ],
  "published": true
}
```
