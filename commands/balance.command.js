const RichEmbed = require('discord.js').RichEmbed;
const cache = require('../cache');

module.exports = (bot, config) => {
  var BlockIO = require('../block_io');

  return {
    aliases: ['balance', 'bal'],
    usage: 'balance',
    description: 'View your balance',
    allowDM: true,
    onCommand: (event, member, channel, args) => {
      BlockIO.getWallet(event.author, wallet => {
        if (wallet) {
          let embed = new RichEmbed()
            .setDescription('Send DOGE to your address to deposit into your balance. Your balance can then be used to tip other users, gamble, and more! (COMING SOON)')
            .setColor(config.colors.main)
            .addField('Balance', wallet.available_balance + ' Ð')
            .addField('Address', wallet.address);
          let pending = wallet.pending_received_balance;
          if (pending && parseFloat(pending) > 0) {
            embed.addField('Pending balance', pending);
          }
          if (member)
            embed.setAuthor(
              'Requested by ' + member.displayName,
              event.author.avatarURL
            );
          embed.setTimestamp();
          channel.send({ embed }).catch(console.error);
        } else {
          let embed = new RichEmbed()
            .setColor(config.colors.error)
            .setTitle('Something went wrong!')
            .setDescription('Try again in a few minutes.')
            .setTimestamp();
          channel.send({ embed });
        }
      });
    }
  };
};
