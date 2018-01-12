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
        price = prices[currency + 'BTC'] * btcPerUsd;
    } else {
        price = prices[currency + base];
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
                case 'price':
                    if (args.length == 0) {
                        let embed = new RichEmbed()
                            .setColor(config.colors.error)
                            .setDescription('Incorrect usage!')
                            .addField('Syntax', `${config.prefix}price (currency) (base [BTC])`)
                            .addField('Example', `${config.prefix}price xrp eth`)
                            .setAuthor('Requested by ' + member.displayName, event.author.avatarURL)
                            .setTimestamp();
                        event.channel.send({embed});
                        return;
                    }
                    
                    let currency = args[0].toUpperCase();
                    let defaultBase = (args[1] || config.default_base).toUpperCase() || "BTC";

                    let embed = new RichEmbed()
                        .setColor(config.colors.main)
                        .addField(currency + '/' + defaultBase.toUpperCase(), getPrice(currency, defaultBase, config.default_decimals));
                    Object.keys(config.other_base_displays || {}).forEach(base => {
                        baseUpper = base.toUpperCase();
                        if (baseUpper !== defaultBase) {
                            embed.addField(currency.toUpperCase() + '/' + baseUpper, getPrice(currency, baseUpper, config.other_base_displays[base] || config.default_decimals).toString());
                        }
                    });

                    BinanceAPI.candlesticks(currency + defaultBase, '1d', (ticks, symbol) => {
                        console.log(ticks);
                        let tick = ticks[ticks.length - 1];
                        if (tick) {
                            embed.addField('24hr High', tick.highPrice)
                                .addField('24hr Low', tick.lowPrice)
                                .addField('24hr Volume', tick.volume)
                        }
                        BinanceAPI.prevDay(currency + 'BTC', (prevDay, symbol) => {
                            embed
                                .addField('24hr Change', `${prevDay.priceChangePercent}% ${prevDay.priceChangePercent > 0 ? '📈' : '📉' }`)
                                .setAuthor('Requested by ' + member.displayName, event.author.avatarURL)
                                .setTimestamp();
                            event.channel.send({embed});
                        });
                    });
                    break;
            }
        }).catch(console.error);
    }
});

bot.login(config.token);
