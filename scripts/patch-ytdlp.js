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

// Saltar si ya está parchado
if (content.includes('import_fs.existsSync')) {
  console.log('[patch-ytdlp] Already patched, skipping.');
  process.exit(0);
}

// Agregar import de fs
content = content.replace(
  'var import_promises = __toESM(require("fs/promises"));',
  'var import_promises = __toESM(require("fs/promises"));\nvar import_fs = __toESM(require("fs"));'
);

// Parchar resolve(): quitar --no-call-home y agregar cookies
content = content.replace(
  `const info = await json(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true
    }).catch`,
  `const cookiesFlags = import_fs.existsSync("/etc/secrets/cookies.txt") ? { cookies: "/etc/secrets/cookies.txt" } : {};
    const info = await json(url, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true,
      ...cookiesFlags,
    }).catch`
);

// Parchar getStreamURL(): quitar --no-call-home y agregar cookies
content = content.replace(
  `const info = await json(song.url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true,
      format: "ba/ba*"
    }).catch`,
  `const cookiesFlags2 = import_fs.existsSync("/etc/secrets/cookies.txt") ? { cookies: "/etc/secrets/cookies.txt" } : {};
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

// Parchar stderr para no romper JSON.parse con warnings
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

fs.writeFileSync(pluginPath, content, 'utf8');
console.log('[patch-ytdlp] Patched successfully.');
