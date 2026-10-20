// Krymper bilder som laddats upp (t.ex. via Pages CMS) så att sajten förblir snabb.
// Körs av .github/workflows/krymp-bilder.yml med de ändrade filerna som argument.
// Längsta sidan blir högst 2400 px, bilden roteras rätt och metadata (t.ex. GPS) tas bort.
// Filnamn och format behålls, så att sökvägarna i innehållsfilerna stämmer.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MAX_SIDE = 2400;
const files = process.argv.slice(2).filter((file) => /\.(jpe?g|png|webp)$/i.test(file) && fs.existsSync(file));

for (const file of files) {
  const input = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();
  let pipeline = sharp(input).rotate().resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true });
  if (ext === ".png") pipeline = pipeline.png({ compressionLevel: 9, palette: false });
  else if (ext === ".webp") pipeline = pipeline.webp({ quality: 82 });
  else pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  const output = await pipeline.toBuffer();
  const meta = await sharp(input).metadata();
  // Skriv bara om filen blev mindre, eller om den hade metadata som ska bort
  if (output.length < input.length || meta.exif || meta.orientation > 1) {
    fs.writeFileSync(file, output);
    console.log(`${file}: ${Math.round(input.length / 1024)} kB -> ${Math.round(output.length / 1024)} kB`);
  } else {
    console.log(`${file}: oförändrad`);
  }
}
