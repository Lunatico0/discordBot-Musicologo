import { Player } from 'discord-player';
import Discord from 'discord.js';
import { YoutubeiExtractor } from 'discord-player-youtubei';

let player;

export const initPlayer = async (client) => {
  player = new Player(client);

  if (player) player.extractors.register(YoutubeiExtractor, {})

  player.events.on('audioTrackAdd', (queue, track) => {
    if (queue.metadata && queue.metadata.channel && queue.isPlaying()) {
      queue.metadata.channel.send(`Se ha agregado a la cola **${track.cleanTitle}**!`);
    }
  })

  player.on('error', (error) => {
    console.error('Player error:', error);
    if (error.metadata && error.metadata.channel) {
      error.metadata.channel.send(`Ocurrió un error en el reproductor: ${error.message}`);
    }
  });
};

export const updatePlayerEmbed = async (interaction, player) => {
  const queue = player.nodes.get(interaction.guildId);

  if (!queue || !queue.currentTrack) {
    return interaction.editReply({ content: 'No hay canciones en la cola.' });
  }

  let currentTrack = queue.currentTrack;

  const embed = new Discord.EmbedBuilder()
    .setTitle(currentTrack.title)
    .setURL(currentTrack.url)
    .setThumbnail(currentTrack.thumbnail)
    .addFields(
      { name: 'Artista', value: currentTrack.author, inline: true },
      { name: 'Duración', value: currentTrack.duration, inline: true },
      { name: 'Volumen', value: `${queue.node.volume}%`, inline: true },
    )
    .setFooter({ text: `Requested by ${interaction.user.username}` });

  const queueList = queue.tracks.map((track, index) => {
    return `${index + 1}. ${track.title} - ${track.author}`;
  }).join('\n');

  if (queueList) {
    embed.addFields({ name: 'Próximas canciones', value: queueList });
  }

  const row = new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('pause')
        .setLabel('Pause')
        .setStyle(Discord.ButtonStyle.Primary),
      new Discord.ButtonBuilder()
        .setCustomId('resume')
        .setLabel('Resume')
        .setStyle(Discord.ButtonStyle.Success),
      new Discord.ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(Discord.ButtonStyle.Secondary),
        new Discord.ButtonBuilder()
        .setCustomId('volume_down')
        .setLabel('🔉-')
        .setStyle(Discord.ButtonStyle.Success),
      new Discord.ButtonBuilder()
        .setCustomId('volume_up')
        .setLabel('🔊+')
        .setStyle(Discord.ButtonStyle.Success)
    );

  await interaction.editReply({ embeds: [embed], components: [row] });
};

export const getPlayer = () => {
  if (!player) throw new Error("Player not initialized. Call initPlayer first.");
  return player;
};
