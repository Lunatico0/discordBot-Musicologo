import Discord, { SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';

export default {
  data: new Discord.SlashCommandBuilder()
    .setName('join')
    .setDescription('Únete a un canal de voz'),

  execute: async (interaction) => {
    console.log('Comando /join recibido.');

    const channel = interaction.member.voice.channel;

    if (!channel) {
      console.log('Error: El usuario no está en un canal de voz.');
      return interaction.reply({ content: 'Debes estar en un canal de voz para unirte.', ephemeral: true });
    }

    console.log(`Intentando unirme al canal: ${channel.name} (ID: ${channel.id})`);

    // Unirse al canal de voz
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      selfDeaf: true,
      selfMute: false,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    connection.on('ready', () => {
      console.log(`Conexión de voz establecida en el canal: ${channel.name}`);
      interaction.reply({ content: `Me he unido a ${channel.name}` });
    });

    connection.on('error', (error) => {
      console.error('Error en la conexión de voz:', error);
      interaction.reply({ content: 'Ocurrió un error al intentar unirme al canal de voz.', ephemeral: true });
    });

    connection.on('stateChange', (oldState, newState) => {
      console.log(`Estado de conexión cambiado de ${oldState.status} a ${newState.status}`);
    });
  },
};
