import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Apaga el bot. Solo el administrador puede usar este comando.'),
  execute: async (interaction) => {
    const isAdmin = interaction.member.permissions.has('ADMINISTRATOR');

    if (!isAdmin) {
      return interaction.reply({
        content: 'No tienes permiso para apagar el bot.',
        ephemeral: true,
      });
    }

    await interaction.reply('Apagando el bot...');

    await interaction.client.destroy();
    process.exit(0);
  },
};
