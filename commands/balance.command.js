const RichEmbed = require('discord.js').RichEmbed;
const cache = require('../cache');

module.exports = (bot, config) => {
  var BlockIO = require('../block_io');

  function getWallet(user, callback) {
    BlockIO.getWalletBalance(user.id, res => {
      res = JSON.parse(res.replace(/\n/g, ''))
      if (res && res.status === 'success' && res.data) {
        callback(res.data);
      } else {
        BlockIO.createWallet(user.id, _res => {
          BlockIO.getWalletBalance(user.id, res1 => {
            res1 = JSON.parse(res1.replace(/\n/g, ''))
            if (res1) callback(res1.data);
            else callback(null);
          });
        });
      }
    });
  }

  return {
    aliases: ['balance', 'bal'],
    usage: 'balance',
    description: 'View your balance',
    allowDM: true,
    onCommand: (event, member, channel, args) => {
      getWallet(event.author, wallet => {
        if (wallet) {
          let embed = new RichEmbed()
            .setColor(config.colors.main)
            .addField('Balance', wallet.available_balance + ' Ð');
          let pending = wallet.pending_received_balance;
          if (pending && parseFloat(pending) > 0) {
            embed.addField('Pending balance', pending);
          }
          if (member) embed.setAuthor('Requested by ' + member.displayName, event.author.avatarURL);
          embed.setTimestamp();
          channel.send({embed}).catch(console.error);
        } else {
          let embed = new RichEmbed()
            .setColor(config.colors.error)
            .setTitle('Something went wrong!')
            .setDescription(
              'Try again in a few minutes.'
            )
            .setTimestamp();
          channel.send({embed});
        }
      });
    }
  };
};