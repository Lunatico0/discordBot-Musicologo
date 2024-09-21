import { SlashCommandBuilder } from 'discord.js';
// import { getPlayer } from '../player.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce una canción hardcodeada'),

  execute: async (interaction) => {
    const player = useMainPlayer()
    // const player = getPlayer();
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply({ content: 'Debes estar en un canal de voz para reproducir música.', ephemeral: true });
    }

    // Hardcodea una URL de YouTube
    // const url = 'https://www.youtube.com/watch?v=kSn9xf6mVWQ;
      const url = "https://open.spotify.com/track/4TtJ19MjslA4AK6BP6rfYx?si=91a401b436874f2c"
    // Conectar al canal de voz y reproducir la canción
    // const queue = player.createQueue(interaction.guild.id, {
    //   metadata: {
    //     channel: interaction.channel,
    //   },
    // });

    // if (!queue.connection) {
    //   await queue.connect(channel);
    // }


    // try {
    //   await player.play(channel, url, {
    //     nodeOptions: {
    //       metadata: interaction,
    //     },
    //   });
    // } catch (error) {
    //   console.error(error)
    //   interaction.reply({ content: 'No se pudo encontrar la canción.', ephemeral: true });
    // }

    const track = await player.play(channel, url, {
      nodeOptions: {
        metadata: interaction,
      },
    });

    if (!track) {
      return interaction.reply({ content: 'No se pudo encontrar la canción.', ephemeral: true });
    }

     await interaction.reply({ content: `¡Comenzando a reproducir **${track.title}**!` });
  },
};
