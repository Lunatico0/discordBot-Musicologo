import { SlashCommandBuilder } from 'discord.js';

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

    await interaction.deferReply();
    await interaction.editReply(`Buscando **${input}**...`);

    await distube.play(voiceChannel, input, {
      textChannel: interaction.channel,
      member: interaction.member,
    });
  },
};
