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
      return interaction.editReply({ content: 'No hay ninguna canción en reproducción.', ephemeral: true });
    }

    queue.node.skip();
    await updatePlayerEmbed(interaction, player);
    interaction.editReply({ content: '⏭️ Canción saltada.' });
  }
};
