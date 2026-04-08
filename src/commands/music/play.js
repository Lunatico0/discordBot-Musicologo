import { SlashCommandBuilder } from 'discord.js';

const isUrl = (str) => str.startsWith('http://') || str.startsWith('https://');

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce una canción de YouTube')
    .addStringOption(option =>
      option
        .setName('cancion')
        .setDescription('Nombre o URL de la canción')
        .setRequired(true)
    ),

  execute: async (interaction, distube) => {
    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: 'Tenés que estar en un canal de voz.', ephemeral: true });
    }

    const input = interaction.options.getString('cancion');
    // DisTube+YtDlpPlugin solo resuelve URLs; para búsquedas hay que usar el prefijo ytsearch:
    const query = isUrl(input) ? input : `ytsearch:${input}`;

    await interaction.deferReply();
    await interaction.editReply(`Buscando **${input}**...`);

    await distube.play(voiceChannel, query, {
      textChannel: interaction.channel,
      member: interaction.member,
    });
  },
};
