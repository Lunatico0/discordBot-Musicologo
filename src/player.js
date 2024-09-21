import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
// import { YouTubeExtractor } from 'discord-player-youtubei';
// import { createAudioPlayer } from '@discordjs/voice';

let player;

export const initPlayer = async (client) => {
  player = new Player(client);

  // Registrar el extractor de YouTube
  // player.extractors.register(YouTubeExtractor);
  //  if(player)await player.extractors.loadDefault();
  if(player) player.extractors.register(YoutubeiExtractor,{})
  // Manejo del evento playerStart
  player.events.on('playerStart', (queue, track) => {
    if (queue.metadata && queue.metadata.channel) {
      queue.metadata.channel.send(`¡Comenzando a reproducir **${track.cleanTitle}**!`);
    }
  });

  // Manejador de errores
  player.on('error', (error) => {
    console.error('Player error:', error);
    if (error.metadata && error.metadata.channel) {
      error.metadata.channel.send(`Ocurrió un error en el reproductor: ${error.message}`);
    }
  });
};

export const getPlayer = () => {
  if (!player) throw new Error("Player not initialized. Call initPlayer first.");
  return player;
};
