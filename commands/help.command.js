const RichEmbed = require('discord.js').RichEmbed;

module.exports = (bot, config) => {
  return {
    aliases: ['help'],
    usage: 'help',
    description: 'Display a help message',
    onCommand: (event, member, channel, args) => {
      let embed = new RichEmbed()
        .setColor(config.colors.main)
        .setDescription('Crypton is a bot made by Trophonix (Lucas#5300) for Cryptocurrency-related things. These are the commands currently available:')
        .setAuthor('Requested by ' + member.displayName, member.user.avatarURL)
        .setTimestamp();
      Object.keys(bot.commands).forEach(key => {
        let command = bot.commands[key];
        embed.addField(config.prefix + command.usage, command.description);
      });
      embed.addField('Need support or have suggestions?', 'Join my support server: https://crypton.fun/support');
      channel.send({embed}).catch(console.error);
    }
  };
};
