import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Apaga el bot. Solo el administrador puede usar este comando.'),
  execute: async (interaction) => {
    // Asegúrate de que solo el administrador o un usuario autorizado pueda ejecutar el comando
    const isAdmin = interaction.member.permissions.has('ADMINISTRATOR');

    if (!isAdmin) {
      return interaction.reply({
        content: 'No tienes permiso para apagar el bot.',
        ephemeral: true,
      });
    }

    // Confirma la acción con el usuario
    await interaction.reply('Apagando el bot...');

    // Desconectar el bot y apagar el proceso de Node.js
    await interaction.client.destroy();
    process.exit(0);
  },
};
