import Discord from 'discord.js';

export default {
  data: new Discord.SlashCommandBuilder()
    .setName('say') // Nombre del comando
    .setDescription('El bot escribira tu mensaje') // Descripcion del comando
    .addStringOption((option) =>
      option
        .setName('mensaje')
        .setDescription('El mensaje que quieres que escriba el bot')
        .setMinLength(3)
        .setMaxLength(100)
        .setRequired(true)
    ),
  execute: async (interaction) => { // Funcion que se ejecuta cuando se usa el comando
    const message = interaction.options.getString('mensaje');
    await interaction.reply({ content: `${message}`, ephemeral: true }).catch(console.error);
  },
};
