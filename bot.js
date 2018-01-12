const config = require('./config.json');

const Discord = require('discord.js');
const RichEmbed = Discord.RichEmbed;
const bot = new Discord.Client();

const BinanceAPI = require('node-binance-api');
BinanceAPI.options(config.binance);

// Turn my pretty keys into compatible ones
config.token.APIKEY = config.token.api_key;
config.token.APISECRET = config.token.api_secret;

var prices = {};
getPrices();

function getPrices() {
    BinanceAPI.prices(ticker => {
        prices = ticker;
    });
}
setInterval(getPrices, 5000);

function getPrice(currency, base, decimals) {
    if (currency === base) return 1;
    let price;
    if (base === 'USD') {
        let btcPerUsd = prices.BTCUSDT;
        if (currency === 'BTC') return parseFloat(btcPerUsd).toFixed(2);
        price = prices[currency + 'BTC'];
        if (price == null) return null;
        price *= btcPerUsd;
    } else {
        price = prices[currency + base];
        if (price == null) return null;
    }
    return parseFloat(price).toFixed(decimals);
}

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
                case 'price': {
                    if (args.length == 0) {
                        let embed = new RichEmbed()
                            .setColor(config.colors.error)
                            .setDescription('Incorrect usage!')
                            .addField('Syntax', `${config.prefix}price (currency) (base; default: BTC)`)
                            .addField('Example', `${config.prefix}price xrp eth`)
                            .setAuthor('Requested by ' + member.displayName, event.author.avatarURL)
                            .setTimestamp();
                        event.channel.send({embed});
                        return;
                    }
                    
                    let currency = args[0].toUpperCase();
                    let defaultBase = (args[1] || config.default_base).toUpperCase() || "BTC";

                    let price = getPrice(currency, defaultBase, config.default_decimals);

                    if (price == null) {
                        let embed = new RichEmbed()
                            .setColor(config.colors.error)
                            .setDescription('Invalid currency or base. Make sure you\'re using abbreviations (e.g. BTC not Bitcoin)')
                            .setAuthor('Requested by ' + member.displayName, event.author.avatarURL)
                            .setTimestamp();
                        event.channel.send(embed);
                        return;
                    }

                    let embed = new RichEmbed()
                        .setColor(config.colors.main)
                        .addField(currency + '/' + defaultBase, price);
                    Object.keys(config.other_base_displays || {}).forEach(base => {
                        baseUpper = base.toUpperCase();
                        if (baseUpper !== defaultBase) {
                            embed.addField(currency.toUpperCase() + '/' + baseUpper, getPrice(currency, baseUpper, config.other_base_displays[base] || config.default_decimals));
                        }
                    });

                    BinanceAPI.candlesticks(currency + defaultBase, '1d', (ticks, symbol) => {
                        let tick = ticks[ticks.length - 1];
                        if (tick) {
                            embed.addField('24hr High', tick[2])
                                .addField('24hr Low', tick[3])
                                .addField('24hr Volume', tick[5])
                        }
                        BinanceAPI.prevDay(currency + 'BTC', (prevDay, symbol) => {
                        embed.addField('24hr Change', `${prevDay.priceChangePercent}% ${prevDay.priceChangePercent > 0 ? '📈' : '📉' }`)
                            .setAuthor('Requested by ' + member.displayName, event.author.avatarURL)
                            .setTimestamp();
                        event.channel.send({embed});
                        });
                    });
                }
                break;
                case 'invite': {
                    
                }
                break;
                case 'help': {
                    let embed = new RichEmbed()
                        .setColor(config.colors.main)
                        .setDescription('Crypton is a bot made by Trophonix (Lucas#5300) for Cryptocurrency-related things. These are the commands currently available:')
                        .addField(`${config.prefix}price (currency) (base; default: BTC)`, 'Displays the price of (currency) against (base) along with some other stats.')
                        .addField(`${config.prefix}invite`, 'Get an invite to add me to your server!')
                        .setAuthor(member.displayName, event.author.avatarURL)
                        .setTimestamp();
                    event.channel.send({embed});
                }
                break;
            }
        }).catch(console.error);
    }
});

bot.login(config.token);
