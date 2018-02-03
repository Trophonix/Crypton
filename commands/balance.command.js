const RichEmbed = require('discord.js').RichEmbed;
const cache = require('../cache');

module.exports = (bot, config) => {
  var BlockIO = require('../block_io');
  console.log(BlockIO);

  function getWallet(user, callback) {
    BlockIO.getWalletBalance({label: user.id}, res => {
      console.log(res);
      if (res && res.status === 'success' && res.data) {
        callback(res.data);
      } else {
        BlockIO.createWallet({label: user.id}, _res => {
          console.log(_res);
          BlockIO.getWalletBalance({label: user.id}, res1 => {
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
            .setTitle('Your balance')
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