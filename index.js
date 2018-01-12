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
    let price = 0;
    if (base === 'USD') {
        let btcPerUsd = prices.BTCUSDT;
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
                            .setAuthor('Requested by ' + (member.nickname || event.author.name), event.author.avatarURL);
                        event.channel.send({embed});
                        return;
                    }
                    
                    let currency = args[0].toUpperCase();
                    let defaultBase = (args[1] || config.default_base).toUpperCase() || "BTC";

                    let embed = new RichEmbed()
                        .setColor(config.colors.main)
                        .addField(currency + '/' + defaultBase.toUpperCase(), getPrice(currency, defaultBase, config.default_decimals), true);
                    Object.keys(config.other_base_displays || {}).forEach(base => {
                        baseUpper = base.toUpperCase();
                        if (baseUpper !== defaultBase) {
                            embed.addField(currency.toUpperCase() + '/' + baseUpper, getPrice(currency, baseUpper, config.other_base_displays[base] || config.default_decimals).toString(), true);
                        }
                    });
                    embed.setAuthor('Requested by ' + (member.nickname || event.author.name), event.author.avatarURL);
                    event.channel.send({embed});
                    break;
            }
        }).catch(console.error);
    }
});

bot.login(config.token);
