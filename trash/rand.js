import Discord from 'discord.js';

export default {
  data: new Discord.SlashCommandBuilder()
    .setName('random')
    .setDescription('Generate a random number between 1 and 100'),
  execute: async (interaction) => {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    interaction.reply(`Tu numero aleatorio es: ${randomNumber}!`).catch(console.error);
  },
};
