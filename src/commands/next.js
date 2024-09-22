import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';
import { updatePlayerEmbed } from '../player.js';

export default {
  data: new SlashCommandBuilder()
    .setName('next')
    .setDescription('Salta a la siguiente canción en la cola'),

  async execute(interaction) {
    const player = useMainPlayer();
    await interaction.deferReply()
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.isPlaying()) {
      return interaction.reply({ content: 'No hay ninguna canción en reproducción.', ephemeral: true });
    }
    await updatePlayerEmbed(interaction, player);

      queue.node.skip();
      interaction.editReply({ content: '⏭️ Canción saltada.' });
    // interaction.reply({ content: '⏭️ Canción saltada.' });
  }
};
