import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('exit')
    .setDescription('Detiene la reproducción y desconecta al bot del canal de voz'),

  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);
    await interaction.deferReply()
    if (!queue) {
      return interaction.editReply({ content: 'No hay música reproduciéndose.', ephemeral: true });
    }

    queue.delete();

    interaction.editReply({ content: '⏹️ Música detenida y bot desconectado.' });
  }
};
