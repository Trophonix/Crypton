const RichEmbed = require('discord.js').RichEmbed;
const cache = require('../cache');

module.exports = (bot, config) => {
  const block_io = require('block_io');
  const BlockIO = new block_io(config.block_io.API_KEY, config.block_io.SECRET, 2);
  return {
    aliases: ['balance', 'bal'],
    usage: 'balance',
    description: 'View your balance',
    onCommand: (event, member, channel, args) => {
      BlockIO.get_address_balance({'label': member.id}, res => {
        if (res.status === 'success' && res.data) {
          let embed = new RichEmbed()
            .setColor(config.colors.main)
            .setTitle('Your balance')
            .addField('Balance', res.data.available_balance);
          let pending = res.data.pending_received_balance;
          if (pending && parseFloat(pending) > 0) {
            embed.addField('Pending balance', pending);
          }
          embed.setAuthor('Requested by ' + member.displayName, event.author.avatarURL)
            .setTimestamp();
          channel.send({embed});
        } else {
          // ...
        }
      });
    }
  };
};