const RichEmbed = require('discord.js').RichEmbed;

module.exports = (bot, config) => {
    return {
        aliases: ['links'],
        usage: 'links',
        description: 'Get links to sites for buying and trading crypto!',
        onCommand: (event, member, channel, args) => {
            let embed = new RichEmbed()
                .setColor(config.colors.main)
                .setDescription('Here are some crypto-related sites! Using these links supports the developer of this bot, and some of them give you a reward as well!')
                .addField('Buy crypto with a credit card', 'https://www.buycryp.to | This site lets you buy the top coins with a credit card almost instantly!')
                .addField('Binance (Exchange)', 'https://www.binance.com/?ref=16393003 | Trade large and small coins with nice and response interfaces and helpful support.')
                .addField('KuCoin (Exchange)', 'http://kucoin.rocks | Awesome exchange which supports smaller coins and has a cool proof of stake system built-in with their own cryptocurrency.')
                .addField('Cryptopia (Exchange)', 'http://cryptopia.site | Another exchange - this one hosts much smaller coins and icos, but be careful which you invest in.')
                .addField('Store your coins more securely', 'http://ledgernano.club | The Ledger Nano S is a highly-rated hardware wallet for storing cryptocurrency safely.')
                .setAuthor("Requested by " + member.displayName, member.user.avatarUrl)
                .setTimestamp();
            channel.send(embed);
        }
    }
}