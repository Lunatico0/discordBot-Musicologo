import pauseCommand from '../src/commands/pause.js';
import resumeCommand from '../src/commands/resume.js';
import nextCommand from '../src/commands/next.js';
import exitCommand from '../src/commands/exit.js';
import { updatePlayerEmbed } from '../src/player.js';
import { useMainPlayer } from 'discord-player';

export const handleInteraction = async (interaction) => {
  if (!interaction.isButton()) return;

  const player = useMainPlayer();
  let queue = player.nodes.get(interaction.guildId);

  if (!queue) {
    queue = player.nodes.create(interaction.guild, {
      metadata: interaction.channel,
      volume: 30,
      leaveOnEnd: false,
      leaveOnStop: false,
    });
  }

  if (!queue || !queue.isPlaying()) {
    return interaction.reply({ content: 'No hay ninguna canción reproduciéndose.', ephemeral: true });
  }

  const { customId } = interaction;

  if (!interaction.guild) return;

  if (customId) {
    switch (customId) {
      case 'pause':
        await pauseCommand.execute(interaction);
        break;
      case 'resume':
        await resumeCommand.execute(interaction);
        break;
      case 'next':
        await nextCommand.execute(interaction);
        break;
      case 'exit':
        await exitCommand.execute(interaction);
        break;
      case 'volume_down': {
        let newVolumeDown = Math.max(queue.node.volume - 10, 0);
        queue.node.setVolume(newVolumeDown);
        await interaction.reply({ content: `🔉 Volumen bajado a ${newVolumeDown}%`, ephemeral: true });
        break;
      }
      case 'volume_up': {
        let newVolumeUp = Math.min(queue.node.volume + 10, 100);
        queue.node.setVolume(newVolumeUp);
        await interaction.reply({ content: `🔊 Volumen subido a ${newVolumeUp}%`, ephemeral: true });
        break;
      }
      default:
        await interaction.reply({ content: 'Comando no reconocido.', ephemeral: true });
        break;
    }
  }

  await updatePlayerEmbed(interaction, player);
};
