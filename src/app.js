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
  plugins: [new YtDlpPlugin({
    update: true,
    ytdlpArgs: fs.existsSync('/etc/secrets/cookies.txt')
      ? ['--cookies', '/etc/secrets/cookies.txt']
      : [],
  })],
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
