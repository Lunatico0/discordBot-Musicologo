import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ajusta el volumen de la música')
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('El nivel de volumen (1-100)')
        .setRequired(true)),

  async execute(interaction) {
    const volumeLevel = interaction.options.getInteger('level');

    if (volumeLevel < 1 || volumeLevel > 100) {
      return interaction.reply({ content: 'Por favor, selecciona un nivel de volumen entre 1 y 100.', ephemeral: true });
    }

    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || !queue.isPlaying()) {
      return interaction.reply({ content: 'No hay ninguna canción reproduciéndose.', ephemeral: true });
    }

    queue.node.setVolume(volumeLevel);
    return interaction.reply({ content: `🔊 Volumen ajustado a ${volumeLevel}%` });
  }
};
