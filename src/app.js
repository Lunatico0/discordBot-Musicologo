import 'dotenv/config';
import './server.js';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { DisTube } from 'distube';
import { YtDlpPlugin } from '@distube/yt-dlp';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// En Render ffmpeg está en el sistema; en local usamos ffmpeg-static como fallback
if (!process.env.RENDER) {
  process.env.PATH = path.dirname(ffmpegStatic) + path.delimiter + process.env.PATH;
  console.log('[ffmpeg] Static:', ffmpegStatic);
}

// Cookies de YouTube — necesarias en Render para evitar el bloqueo por IP de cloud
if (process.env.YT_COOKIES) {
  try {
    const cookies = JSON.parse(process.env.YT_COOKIES);
    const lines = ['# Netscape HTTP Cookie File'];
    for (const c of cookies) {
      const domain = c.domain || '.youtube.com';
      const subdomains = domain.startsWith('.') ? 'TRUE' : 'FALSE';
      const secure = c.secure ? 'TRUE' : 'FALSE';
      const expiry = Math.floor(c.expirationDate ?? c.expires ?? (Date.now() / 1000 + 365 * 86400));
      lines.push(`${domain}\t${subdomains}\t${c.path || '/'}\t${secure}\t${expiry}\t${c.name}\t${c.value}`);
    }
    fs.writeFileSync('/tmp/yt-cookies.txt', lines.join('\n'));
    process.env.YTDLP_COOKIES_PATH = '/tmp/yt-cookies.txt';
    console.log(`[Cookies] Escritas ${cookies.length} cookies en /tmp/yt-cookies.txt`);
  } catch (e) {
    console.error('[Cookies] Error al parsear YT_COOKIES:', e.message);
  }
}

const TOKEN     = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error('[Error] Faltan BOT_TOKEN o CLIENT_ID en el .env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const distube = new DisTube(client, {
  plugins: [new YtDlpPlugin({ update: true })],
});

// --- Eventos de DisTube ---

distube.on('playSong', (queue, song) => {
  console.log('[DisTube] Reproduciendo:', song.name);
  queue.textChannel?.send(`Reproduciendo: **${song.name}** (${song.formattedDuration})`);
});

distube.on('addSong', (queue, song) => {
  queue.textChannel?.send(`Agregado a la cola: **${song.name}** (${song.formattedDuration})`);
});

distube.on('error', (error, queue) => {
  console.error('[DisTube Error]', error.message);
  queue?.textChannel?.send(`Error: ${error.message}`);
});

distube.on('finish', (queue) => {
  console.log('[DisTube] Cola terminada');
});

// --- Carga de comandos ---

client.commands = new Collection();

const loadCommands = async (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await loadCommands(fullPath);
    } else if (entry.name.endsWith('.js')) {
      const { default: command } = await import(pathToFileURL(fullPath).href);
      if (command?.data?.name) {
        client.commands.set(command.data.name, command);
        console.log(`[Commands] Cargado: /${command.data.name}`);
      }
    }
  }
};

// --- Eventos del cliente ---

client.once('clientReady', async () => {
  console.log(`[Bot] Conectado como ${client.user.tag}`);

  const commandsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands');
  if (fs.existsSync(commandsDir)) {
    await loadCommands(commandsDir);
  }
});

// Comando de prueba hardcodeado — sirve para verificar audio antes de tener slash commands
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.content !== '!test') return;

  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel) {
    return message.reply('Tenés que estar en un canal de voz.');
  }

  try {
    await message.reply('Reproduciendo canción de prueba...');
    await distube.play(voiceChannel, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
      textChannel: message.channel,
      member: message.member,
    });
  } catch (error) {
    console.error('[!test Error]', error.message);
    message.channel.send(`Error: ${error.message}`);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, distube);
  } catch (error) {
    console.error(`[Error] /${interaction.commandName}:`, error);
    const reply = { content: 'Ocurrió un error al ejecutar el comando.', ephemeral: true };
    interaction.replied || interaction.deferred
      ? interaction.editReply(reply)
      : interaction.reply(reply);
  }
});

client.login(TOKEN);
