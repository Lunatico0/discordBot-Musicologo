import Discord from 'discord.js';
import { getPing } from '../app.js';

export default {
  data: new Discord.SlashCommandBuilder()
    .setName('ping')
    .setDescription('pong'),
  execute: async (interaction) => {
    const ping = getPing();
    await interaction.reply(`El ping del BOT es ${ping}ms`);
  },
};
