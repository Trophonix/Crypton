const RichEmbed = require('discord.js').RichEmbed;
const cache = require('../cache');

const BlockIO = require('block_io')(config.block_io.API_KEY, config.block_io.SECRET, 2);

module.exports = (bot, config) => {
  return {
    aliases: ['balance', 'bal'],
    usage: 'balance',
    description: 'View your balance',
    onCommand: (event, member, channel, args) => {
      let color = config.colors.main;
      BlockIO.get_address_balance({'label': member.id}, res => {
        if (res.status === 'success' && res.data) {
          let embed = new RichEmbed()
            .setColor(color)
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