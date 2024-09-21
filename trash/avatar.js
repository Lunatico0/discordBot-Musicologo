import Discord from 'discord.js';

export default {
  data: new Discord.SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Muestra el avatar de Discord del usuario')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Elige un usuario')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const { guild, user: requester } = interaction;
    const target = interaction.options.getUser('user');
    const requesterMember = await guild.members.fetch(requester.id);
    const targetMember = await guild.members.fetch(target.id);

    const imageProperties = { size: 1024, dynamic: true };
    const avatar =
      targetMember.avatarURL(imageProperties) ||
      targetMember.user.avatarURL(imageProperties);

    if (!avatar) {
      return interaction.reply({ content: 'No se pudo obtener el avatar del usuario.', ephemeral: true });
    }

    const embed = new Discord.EmbedBuilder()
      .setAuthor({
        name: `${requesterMember.displayName}`,
        iconURL: requesterMember.user.avatarURL(),
      })
      .setTitle(`🙎🏽 ${targetMember.displayName}'s Avatar`)
      .setColor('Aqua')
      .setImage(avatar)
      .setFooter({
        text: `${requesterMember.displayName} solicita la imagen de ${targetMember.displayName} en ${guild.name}`,
        iconURL: requesterMember.user.avatarURL(),
      });

    interaction.reply({
      embeds: [embed],
    }).catch(console.error);
  },
};
