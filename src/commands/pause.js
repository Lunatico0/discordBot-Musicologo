import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pausa la reproducción actual'),

  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.isPlaying()) {
      return interaction.reply({ content: 'No hay ninguna canción reproduciéndose.', ephemeral: true });
    }

    queue.node.pause();
    interaction.reply({ content: '⏸️ Canción pausada.' });
  }
};
