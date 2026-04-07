import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginPath = path.resolve(__dirname, '../node_modules/@distube/yt-dlp/dist/index.js');

if (!fs.existsSync(pluginPath)) {
  console.log('[patch-ytdlp] Plugin not found, skipping.');
  process.exit(0);
}

let content = fs.readFileSync(pluginPath, 'utf8');

// 1. Agregar import de fs (si no está)
if (!content.includes('var import_fs = __toESM(require("fs"));')) {
  content = content.replace(
    'var import_promises = __toESM(require("fs/promises"));',
    'var import_promises = __toESM(require("fs/promises"));\nvar import_fs = __toESM(require("fs"));'
  );
}

// 2. Reemplazar el bloque resolve() completo — con o sin noCallHome, con o sin cookiesFlags
content = content.replace(
  /async resolve\(url, options\) \{[\s\S]*?const info = await json\(url, \{[\s\S]*?\}\)\.catch/,
  `async resolve(url, options) {
    const cookiesFlags = import_fs.existsSync("/tmp/cookies.txt") ? { cookies: "/tmp/cookies.txt" } : {};
    const info = await json(url, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true,
      ...cookiesFlags,
    }).catch`
);

// 3. Reemplazar el bloque getStreamURL() completo
content = content.replace(
  /const info = await json\(song\.url, \{[\s\S]*?format: "ba\/ba\*"[\s\S]*?\}\)\.catch/,
  `const cookiesFlags2 = import_fs.existsSync("/tmp/cookies.txt") ? { cookies: "/tmp/cookies.txt" } : {};
    const info = await json(song.url, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true,
      format: "ba/ba*",
      ...cookiesFlags2,
    }).catch`
);

// 4. Parchar stderr (si no está)
if (!content.includes('let stderrOutput')) {
  content = content.replace(
    `    process2.stderr?.on("data", (chunk) => {
      output += chunk;
    });`,
    `    let stderrOutput = "";
    process2.stderr?.on("data", (chunk) => {
      stderrOutput += chunk;
    });`
  );
  content = content.replace(
    `    process2.on("close", (code) => {
      if (code === 0) resolve(JSON.parse(output));
      else reject(new Error(output));
    });`,
    `    process2.on("close", (code) => {
      if (code === 0) {
        try { resolve(JSON.parse(output)); }
        catch (e) { reject(new Error(stderrOutput || output || "yt-dlp returned invalid JSON")); }
      } else {
        reject(new Error(stderrOutput || output || "yt-dlp exited with code " + code));
      }
    });`
  );
}

fs.writeFileSync(pluginPath, content, 'utf8');
console.log('[patch-ytdlp] Patched successfully.');
