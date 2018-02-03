const RichEmbed = require('discord.js').RichEmbed;

module.exports = (bot, config) => {
  var BlockIO = require('../block_io');

  return {
    aliases: ['tip'],
    usage: 'tip (@user)',
    description: 'Tip a user DOGE from your balance ($bal)',
    onCommand: (event, member, channel, args) => {
      if (args.length !== 2) {
        let embed = new RichEmbed()
          .setColor(config.colors.error)
          .setTitle('Incorrect usage!')
          .addField('Syntax', `${config.prefix}tip (@user) (amount)`)
          .addField('Example', `${config.prefix}tip @Lucas#5300 10`)
          .setAuthor(
            'Requested by ' + member.displayName,
            event.author.avatarURL
          )
          .setTimestamp();
        channel.send({ embed }).catch(console.error);
        return;
      }
      let mentions = event.mentions.users.array();
      console.log(mentions);
      let user = mentions[0];
      if (!user) {
        let embed = new RichEmbed()
          .setColor(config.colors.error)
          .setTitle('Incorrect usage!')
          .addField('Syntax', `${config.prefix}tip (@user) (amount)`)
          .addField('Example', `${config.prefix}tip @Lucas#5300 10`)
          .setAuthor(
            'Requested by ' + member.displayName,
            event.author.avatarURL
          )
          .setTimestamp();
        channel.send({ embed }).catch(console.error);
        return;
      }
      let amount = parseFloat(args[1]);
      if (!amount || isNaN(amount)) {
        let embed = new RichEmbed()
          .setColor(config.colors.error)
          .setTitle('Invalid amount!')
          .addField('Error', `${args[1]} is not a valid amount to send.`)
          .setAuthor(
            'Requested by ' + member.displayName,
            event.author.avatarURL
          )
          .setTimestamp();
        channel.send({ embed }).catch(console.error);
      }
      try {
        BlockIO.getWallet(event.author, senderWallet => {
          if (senderWallet.available_balance >= amount) {
            BlockIO.getWallet(user, receiverWallet => {
              if (receiverWallet) {
                BlockIO.send(event.author.id, user.id, amount, res => {
                  if (res && res.status === 'success') {
                    let embed = new RichEmbed()
                      .setColor(config.colors.main)
                      .setTitle('Success!')
                      .setDescription(`Successfully sent ${amount} Ð to ${user.toString()}`)
                      .setAuthor(
                        'Requested by ' + member.displayName,
                        event.author.avatarURL
                      )
                      .setTimestamp();
                    channel.send({ embed }).catch(console.error);
                  } else {
                    throw new Error();
                  }
                });
              } else {
                throw new Error();
              }
            });
          } else {
            let embed = new RichEmbed()
              .setColor(config.colors.error)
              .setTitle('Insufficient balance')
              .addField('Error', `You don't have ${amount} Ð in your $balance.`)
              .setAuthor(
                'Requested by ' + member.displayName,
                event.author.avatarURL
              )
              .setTimestamp();
            channel.send({ embed });
          }
        });
      } catch (err) {
        let embed = new RichEmbed()
          .setColor(config.colors.error)
          .setTitle('Something went wrong!')
          .setDescription('Try again in a few minutes.')
          .setTimestamp();
        channel.send({ embed });
      }
    }
  };
};
