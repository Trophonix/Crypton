const RichEmbed = require('discord.js').RichEmbed;
const BinanceAPI = require('node-binance-api');

function getPrice(currency, base, decimals) {
    if (currency === base) return 1;
    let price;
    if (base === 'USD') {
        let btcPerUsd = BinanceAPI.cache.BTCUSDT;
        if (currency === 'BTC') return parseFloat(btcPerUsd).toFixed(2);
        price = BinanceAPI.cache[currency + 'BTC'];
        if (price == null) return null;
        price *= btcPerUsd;
    } else {
        price = BinanceAPI.cache[currency + base];
        if (price == null) return null;
    }
    return parseFloat(price).toFixed(decimals);
}

module.exports = (bot, config) => {
    return {
        aliases: ['price'],
        usage: 'price (currency) (base [BTC])',
        description: 'Display price of (currency) in relation to (base) along with other data.',
        onCommand: (event, member, channel, args) => {
            if (args.length == 0) {
                let embed = new RichEmbed()
                    .setColor(config.colors.error)
                    .setDescription('Incorrect usage!')
                    .addField('Syntax', `${config.prefix}price (currency) (base; default: BTC)`)
                    .addField('Example', `${config.prefix}price xrp eth`)
                    .setAuthor('Requested by ' + member.displayName, event.author.avatarURL)
                    .setTimestamp();
                channel.send({embed});
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
                channel.send({embed});
                return;
            }

            let temp = new RichEmbed()
                .setColor(config.colors.main)
                .setTitle('Please wait.')
                .setDescription("Gathering data... <a:loading:401678813605527552>")
                .setTimestamp();
            console.log(temp);
            console.log('sending');
            channel.send({embed: temp}).then(tempMessage => {
                console.log('sent');
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
                        channel.send({embed}).then(res => tempMessage.delete()).catch(console.error);
                    });
                });
            }).catch(console.error);
        }
    }
}