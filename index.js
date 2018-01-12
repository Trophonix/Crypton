const config = require('./config.json');

const Discord = require('discord.js');
const RichEmbed = Discord.RichEmbed;
const bot = new Discord.Client();

const BinanceAPI = require('node-binance-api');
BinanceAPI.options(config.binance);

// Turn my pretty keys into compatible ones
config.token.APIKEY = config.token.api_key;
config.token.APISECRET = config.token.api_secret;

bot.on('ready', () => {
    bot.user.setPresence({
        status: 'online',
        game: {
            name: `${config.prefix}help`
        }
    })
    console.log('Connected to discord.');
});

bot.on('message', event => {
    let message = event.content.toLowerCase();
    if (message.startsWith(config.prefix)) {
        message = message.replace(config.prefix, '');
        let args = message.split(' ');
        let command = args[0];
        args.splice(0, 1);
        event.guild.fetchMember(event.author).then(member => {
            switch (command) {
                case 'price':
                    if (args.length == 0) {
                        let embed = new RichEmbed()
                            .setColor(config.colors.error)
                            .setDescription('Incorrect usage!')
                            .addField('Syntax', `${config.prefix}price (currency) (base [BTC])`)
                            .addField('Example', `${config.prefix}price xrp eth`)
                            .setAuthor('Requested by ' + member.nickname, event.author.avatarURL);
                        event.channel.send({embed});
                        return;
                    }
                    
                    let currency = args[0].toUpperCase();
                    let defaultBase = (args[1] || config.default_base).toUpperCase() || "BTC";

                    BinanceAPI.prices(ticker => {
                        let price = ticker[currency + defaultBase.toUpperCase()];
                        let embed = new RichEmbed()
                            .setColor(config.colors.main)
                            .addField(currency + '/' + defaultBase.toUpperCase(), price, true);
                        (config.other_base_displays || []).forEach(base => {
                            if (base.toUpperCase() !== defaultBase) {
                                embed.addField(currency.toUpperCase() + '/' + base.toUpperCase(), ticker[currency + base.toUpperCase()], true);
                            }
                        });
                        event.channel.send({embed});
                    });
                    break;
            }
        }).catch(console.error);
    }
});

bot.login(config.token);
