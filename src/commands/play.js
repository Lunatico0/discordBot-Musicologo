import { useMainPlayer } from 'discord-player';
// import {setTimeout as wait} from 'node:timers/promises'
import Discord from 'discord.js';

export default {
  data: new Discord.SlashCommandBuilder()
    .setName('play') // Nombre del comando
    .setDescription('query')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('El mensaje que quieres que escriba el bot')
        .setMinLength(3)
        .setMaxLength(100)
        .setRequired(false)
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
    if (query._data.tracks.length > 0) {
      query._data.tracks.forEach(track => {
        console.log(`titulo: ${track.title}, artista: ${track.author}, source: ${track.source}`);
      });
    }

    if (!query.hasTracks()) {

      return interaction.editReply("Eroor no hay cancion");
    }

    try {
      const { track, error } = await player.play(channel, query, {
        nodeOptions: {
          metadata: interaction,
        },audioPlayerOptions:{queue:true},afterSearch:async ()=>{
          await interaction.editReply(`Busqueda finalizada`)}
      })
      console.log(error)
      if (!track) {
        console.log("No se obtuvo un track válido.");
        return interaction.editReply("No se pudo obtener el track para la reproducción.");
      }

      return
    } catch (e) {
      console.error(e);
      return interaction.editReply("Error:",e);
    }
  },
};
