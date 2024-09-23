import Discord, { Client } from "discord.js";
import fs from 'fs';
import path from 'path';
import { REST } from "@discordjs/rest";
import { config } from "dotenv";
import { initPlayer } from './player.js';
import { handleInteraction } from './controller.js';

config();
const TOKEN = process.env.Musicologo_TOKEN;
const ClientID = process.env.Client_ID;

const client = new Client({ intents: 53608447 });
const commandsPath = path.resolve('./src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const rest = new REST({ version: '10' }).setToken(TOKEN);

client.commands = new Discord.Collection();

// Cargar los comandos desde los archivos
(async () => {
  for (const commandFile of commandFiles) {
    try {
      const { default: command } = await import(`./commands/${commandFile}`);
      if (command && command.data && command.data.name) {
        if (!client.commands.has(command.data.name)) {
          client.commands.set(command.data.name, command);
        }
      } else {
        console.log(`El comando en ${commandFile} no está correctamente estructurado.`);
      }
    } catch (error) {
      console.error(`Error al cargar el comando ${commandFile}:`, error);
    }
  }
})();

// Registrar comandos cuando el bot está listo
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await initPlayer(client);

  // Iterar sobre todos los servidores en los que el bot está presente
  const guilds = client.guilds.cache;

  guilds.forEach(async (guild) => {
    try {
      await rest.put(
        Discord.Routes.applicationGuildCommands(ClientID, guild.id),
        {
          body: client.commands.map((cmd) => cmd.data.toJSON()),
        }
      );
      console.log(`Registered slash commands for guild ${guild.name} (ID: ${guild.id})`);
    } catch (error) {
      console.error(`Error registering commands for guild ${guild.name} (ID: ${guild.id}):`, error);
    }
  });
});

// Manejar interacciones con botones y comandos
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    await handleInteraction(interaction);
  }

  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return interaction.reply({ content: 'No command found with that name.', ephemeral: true });

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command: ${error}`);
    interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
  }
});

// Iniciar sesión con el bot
client.login(TOKEN);
