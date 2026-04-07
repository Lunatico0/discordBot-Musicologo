import { SlashCommandBuilder } from 'discord.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWindows = process.platform === 'win32';
const YTDLP_BIN = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
const YTDLP_PATH = path.resolve(__dirname, `../../../node_modules/@distube/yt-dlp/bin/${YTDLP_BIN}`);
const COOKIES_PATH = '/etc/secrets/cookies.txt';

const searchYouTube = (query) => new Promise((resolve, reject) => {
  const args = [
    `ytsearch1:${query}`,
    '--dump-single-json',
    '--skip-download',
    '--no-warnings',
    '--flat-playlist',
  ];

  if (fs.existsSync(COOKIES_PATH)) {
    args.push('--cookies', COOKIES_PATH);
  }

  const proc = spawn(YTDLP_PATH, args);

  let stdout = '';
  proc.stdout.on('data', chunk => stdout += chunk);
  proc.on('close', code => {
    if (code !== 0) return reject(new Error('yt-dlp search failed'));
    try {
      const info = JSON.parse(stdout);
      const url = info.entries?.[0]?.url ?? info.webpage_url;
      if (!url) throw new Error('No results found');
      resolve(url);
    } catch (e) {
      reject(e);
    }
  });
  proc.on('error', reject);
});

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce una canción de YouTube')
    .addStringOption(option =>
      option
        .setName('cancion')
        .setDescription('Nombre o URL de la canción')
        .setRequired(true)
    ),

  execute: async (interaction, distube) => {
    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: 'Tenés que estar en un canal de voz.', ephemeral: true });
    }

    const input = interaction.options.getString('cancion');
    const isUrl = input.startsWith('http://') || input.startsWith('https://');

    await interaction.deferReply();
    await interaction.editReply(`Buscando **${input}**...`);

    let url = input;
    if (!isUrl) {
      try {
        url = await searchYouTube(input);
      } catch (e) {
        console.error('[Search Error]', e.message);
        return interaction.editReply('No encontré ninguna canción con ese nombre.');
      }
    }

    await distube.play(voiceChannel, url, {
      textChannel: interaction.channel,
      member: interaction.member,
    });
  },
};
