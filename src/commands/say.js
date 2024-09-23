import Discord from 'discord.js';

export default {
  data: new Discord.SlashCommandBuilder()
    .setName('say')
    .setDescription('El bot escribira tu mensaje')
    .addStringOption((option) =>
      option
        .setName('mensaje')
        .setDescription('El mensaje que quieres que escriba el bot')
        .setMinLength(3)
        .setMaxLength(300)
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const message = interaction.options.getString('mensaje');
    await interaction.reply({ content: `${message}`, ephemeral: true }).catch(console.error);
  },
};
