import 'dotenv/config';
import './server.js';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import { DisTube } from 'distube';
import { YtDlpPlugin } from '@distube/yt-dlp';
import ffmpeg from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Hacer que ffmpeg-static sea encontrable por distube
process.env.PATH = path.dirname(ffmpeg) + path.delimiter + process.env.PATH;

// Copiar cookies a /tmp donde yt-dlp puede escribir
const COOKIES_SRC = '/etc/secrets/cookies.txt';
const COOKIES_DST = '/tmp/cookies.txt';
console.log('[Cookies] Buscando en:', COOKIES_SRC, '→ existe:', fs.existsSync(COOKIES_SRC));
if (fs.existsSync(COOKIES_SRC)) {
  fs.copyFileSync(COOKIES_SRC, COOKIES_DST);
  console.log('[Cookies] Copiadas a /tmp/cookies.txt → existe:', fs.existsSync(COOKIES_DST));
} else {
  console.log('[Cookies] ADVERTENCIA: no se encontró el archivo de cookies en /etc/secrets/');
  // Listar /etc/secrets/ para ver qué hay
  try {
    const files = fs.readdirSync('/etc/secrets/');
    console.log('[Cookies] Archivos en /etc/secrets/:', files);
  } catch (e) {
    console.log('[Cookies] No se pudo leer /etc/secrets/:', e.message);
  }
}

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.Client_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error('[Error] Faltan BOT_TOKEN o Client_ID en el .env');
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

distube.on('playSong', (queue, song) => {
  queue.textChannel.send(`Reproduciendo: **${song.name}** (${song.formattedDuration})`);
});

distube.on('addSong', (queue, song) => {
  queue.textChannel.send(`Agregado a la cola: **${song.name}** (${song.formattedDuration})`);
});

distube.on('error', (error, queue) => {
  console.error('[DisTube Error]', error);
  if (queue?.textChannel) queue.textChannel.send(`Error: ${error.message}`);
});

// Carga recursiva de comandos
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

client.once('clientReady', async () => {
  console.log(`[Bot] Conectado como ${client.user.tag}`);

  const commandsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands');
  await loadCommands(commandsDir);

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  for (const guild of client.guilds.cache.values()) {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, guild.id),
      { body: client.commands.map(cmd => cmd.data.toJSON()) }
    );
    console.log(`[Commands] Registrados en: ${guild.name}`);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || message.content !== '!test') return;
  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel) return message.reply('Tenés que estar en un canal de voz.');
  await message.reply('Probando reproducción...');
  await distube.play(voiceChannel, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
    textChannel: message.channel,
    member: message.member,
  });
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
