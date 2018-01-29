const RichEmbed = require('discord.js').RichEmbed;

module.exports = (bot, config) => {
  return {
    aliases: ['invite', 'add'],
    usage: 'invite',
    description: 'Invite me to your discord server',
    onCommand: (event, member, channel, args) => {
      let embed = new RichEmbed()
        .setColor(config.colors.main)
        .setTitle('Click here to add Crypton to your server!')
        .setURL(config.invite_url)
        .setAuthor('Requested by ' + member.displayName, member.user.avatarURL)
        .setTimestamp();
      channel.send({ embed }).catch(console.error);
    }
  };
};
