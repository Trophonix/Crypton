const Discord = require('discord.js');
const RichEmbed = Discord.RichEmbed;

module.exports = (bot, config) => {
    return {
        aliases: ['suggest'],
        usage: 'suggest (idea...)',
        description: 'Suggest ideas to my creator (abuse will lead to being blocked from using this command)',
        onCommand: (event, member, channel, args) => {
            if (args.length == 0) {
                let embed = new RichEmbed()
                    .setColor(config.colors.error)
                    .setTitle('Incorrect usage!')
                    .addField('Syntax', `${config.prefix}suggest (idea...)`)
                    .addField('Example', `${config.prefix}suggest More potatoes pls`)
                    .setAuthor('Requested by ' + member.displayName, event.author.avatarURL)
                    .setTimestamp();
                channel.send({embed});
                return;
            }

            let response = new RichEmbed()
                .setColor(config.colors.main)
                .setTitle('Suggestion sent!')
                .setTimestamp();
            channel.send({embed: response});
            
            let lucas = bot.users.get('138168338525192192');
            if (lucas) {
                let embed = new RichEmbed()
                    .setColor(config.colors.main)
                    .setDescription(args.join(' '))
                    .setAuthor('Suggestion from ' + event.author.username + '#' + event.author.discriminator, event.author.avatarURL)
                    .setTimestamp();
                if (!lucas.dmChannel) {
                    lucas.createDM().then(dmChannel => dmChannel.send({embed}));
                } else {
                    lucas.dmChannel.send({embed});
                }
            }
        }
    }
}