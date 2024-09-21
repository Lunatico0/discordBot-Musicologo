import pauseCommand from '../src/commands/pause.js';
import resumeCommand from '../src/commands/resume.js';
import nextCommand from '../src/commands/next.js';
import exitCommand from '../src/commands/exit.js';
import { updatePlayerEmbed } from '../src/player.js';
import { useMainPlayer } from 'discord-player';

export const handleInteraction = async (interaction) => {
  if (!interaction.isButton()) return;
  const player = useMainPlayer();

  const { customId } = interaction;
  if (!interaction.guild) return;

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
    default:
      await interaction.reply({ content: 'Comando no reconocido.', ephemeral: true });
      break;
  }

  // Actualizar el embed después de la interacción
  await updatePlayerEmbed(interaction, player);
};
