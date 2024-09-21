import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('next')
    .setDescription('Salta a la siguiente canción en la cola'),

  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.isPlaying()) {
      return interaction.reply({ content: 'No hay ninguna canción en reproducción.', ephemeral: true });
    }

    queue.node.skip();
    interaction.reply({ content: '⏭️ Canción saltada.' });
  }
};
