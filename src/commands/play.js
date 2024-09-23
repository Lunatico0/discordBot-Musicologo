import { useMainPlayer } from 'discord-player';
import { updatePlayerEmbed } from '../player.js'; // Asegúrate de importar esta función
import Discord from 'discord.js';

export default {
  data: new Discord.SlashCommandBuilder()
    .setName('play')
    .setDescription('query')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Cancion que quieras escuchar')
        .setMinLength(3)
        .setMaxLength(100)
        .setRequired(true)
    ),
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    const player = useMainPlayer();
    const channel = interaction.member.voice.channel;
    const consulta = interaction.options.getString('query', true);
    await interaction.deferReply();

    const query = await player.search(consulta, {
      requestedBy: interaction.user,
    });

    if (!query.hasTracks()) {
      return interaction.editReply("Error: No hay canción.");
    }

    try {
      await player.play(channel, query, {
        nodeOptions: {
          metadata: interaction,
        }
      });

      // Actualiza el embed con la canción actual y la cola
      await updatePlayerEmbed(interaction, player);

    } catch (e) {
      console.error(e);
      return interaction.editReply("Error al reproducir la canción.");
    }
  },
};
