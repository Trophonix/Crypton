const RichEmbed = require('discord.js').RichEmbed;
const cache = require('../cache');

module.exports = (bot, config) => {
  const block_io = require('block_io');
  const BlockIO = new block_io(config.block_io.API_KEY, config.block_io.SECRET, 2);

  function getWallet(user, callback) {
    BlockIO.get_address_balance({'label': user.id}, res => {
      console.log(res);
      if (res && res.status === 'success' && res.data) {
        callback(res.data);
      } else {
        BlockIO.get_new_address({'label': user.id}, _res => {
          BlockIO.get_address_balance({label: user.id}, res1 => {
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