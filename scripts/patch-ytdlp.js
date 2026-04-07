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

// Si ya está parchado correctamente, no hacer nada
if (content.includes('// @patched-cookies-v3')) {
  console.log('[patch-ytdlp] Already patched, skipping.');
  process.exit(0);
}

// Si tiene el marcador de versión anterior o está doblemente parchado, restaurar desde cero
// Reemplazamos el bloque resolve() completo sin importar su estado
content = content.replace(
  /async resolve\(url, options\) \{[\s\S]*?return new YtDlpSong\(this, info, options\);\s*\}/,
  `async resolve(url, options) {
    // @patched-cookies-v3
    const cookiesFlags = import_fs.existsSync("/tmp/cookies.txt") ? { cookies: "/tmp/cookies.txt" } : {};
    const info = await json(url, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true,
      ...cookiesFlags,
    }).catch((e2) => {
      throw new import_distube.DisTubeError("YTDLP_ERROR", \`\${e2.stderr || e2}\`);
    });
    if (isPlaylist(info)) {
      if (info.entries.length === 0) throw new import_distube.DisTubeError("YTDLP_ERROR", "The playlist is empty");
      return new import_distube.Playlist(
        {
          source: info.extractor,
          songs: info.entries.map((i) => new YtDlpSong(this, i, options)),
          id: info.id.toString(),
          name: info.title,
          url: info.webpage_url,
          thumbnail: info.thumbnails?.[0]?.url
        },
        options
      );
    }
    return new YtDlpSong(this, info, options);
  }`
);

// Reemplazamos el bloque getStreamURL() completo sin importar su estado
content = content.replace(
  /async getStreamURL\(song\) \{[\s\S]*?return info\.url;\s*\}/,
  `async getStreamURL(song) {
    if (!song.url) {
      throw new import_distube.DisTubeError("YTDLP_PLUGIN_INVALID_SONG", "Cannot get stream url from invalid song.");
    }
    const cookiesFlags = import_fs.existsSync("/tmp/cookies.txt") ? { cookies: "/tmp/cookies.txt" } : {};
    const info = await json(song.url, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true,
      format: "ba/ba*",
      ...cookiesFlags,
    }).catch((e2) => {
      throw new import_distube.DisTubeError("YTDLP_ERROR", \`\${e2.stderr || e2}\`);
    });
    if (isPlaylist(info)) throw new import_distube.DisTubeError("YTDLP_ERROR", "Cannot get stream URL of a entire playlist");
    return info.url;
  }`
);

// Asegurarse que import_fs existe
if (!content.includes('var import_fs = __toESM(require("fs"));')) {
  content = content.replace(
    'var import_promises = __toESM(require("fs/promises"));',
    'var import_promises = __toESM(require("fs/promises"));\nvar import_fs = __toESM(require("fs"));'
  );
}

fs.writeFileSync(pluginPath, content, 'utf8');
console.log('[patch-ytdlp] Patched successfully.');
