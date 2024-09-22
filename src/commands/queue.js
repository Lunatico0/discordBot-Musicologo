import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';


export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Muestra la cola de reproducción'),

  async execute(interaction) {
    const player = useMainPlayer()
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.tracks.data.length) {
      return interaction.reply({ content: 'No hay canciones en la cola.', ephemeral: true });
    }

    const queueString = queue.tracks.map((track, index) => `${index + 1}. ${track.title}`).join('\n');
    interaction.reply({ content: `🎶 Cola de reproducción:\n${queueString}` });
  }
};
