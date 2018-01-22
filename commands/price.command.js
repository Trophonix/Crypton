const RichEmbed = require('discord.js').RichEmbed;
const BinanceAPI = require('node-binance-api');

function getPrice (currency, base, decimals) {
  if (currency === base) return 1;
  let price;
  if (base === 'USD') {
    let btcPerUsd = BinanceAPI.cache.BTCUSDT;
    if (currency === 'BTC') return parseFloat(parseFloat(btcPerUsd).toFixed()).toString();
    price = BinanceAPI.cache[currency + 'BTC'];
    if (price === null) return null;
    price *= btcPerUsd;
    return parseFloat(price).toFixed(decimals);
  } else {
    price = BinanceAPI.cache[currency + base];
    if (price === null) return null;
  }
  return parseFloat(parseFloat(price).toFixed(decimals)).toString();
}

function handleError (err, tempMessage) {
  tempMessage.delete();
  console.error(err);
}

module.exports = (bot, config) => {
  return {
    aliases: ['price'],
    usage: 'price (currency) (base [BTC])',
    description: 'Display price of (currency) in relation to (base) along with other data.',
    onCommand: (event, member, channel, args) => {
      if (args.length === 0) {
        let embed = new RichEmbed()
          .setColor(config.colors.error)
          .setTitle('Incorrect usage!')
          .addField('Syntax', `${config.prefix}price (currency) (base default: BTC)`)
          .addField('Example', `${config.prefix}price xrp eth`)
          .setAuthor('Requested by ' + member.displayName, event.author.avatarURL)
          .setTimestamp();
        channel.send({embed}).catch(console.error);
        return;
      }

      let currency = args[0].toUpperCase();
      let defaultBase = currency === 'BTC' ? 'USDT' : (args[1] || config.default_base).toUpperCase() || 'BTC';

      let price = getPrice(currency, defaultBase, config.default_decimals);

      if (price === null) {
        let embed = new RichEmbed()
          .setColor(config.colors.error)
          .setTitle("Unknown market. Make sure you're using abbreviations (e.g. BTC not Bitcoin)")
          .setAuthor('Requested by ' + member.displayName, event.author.avatarURL)
          .setTimestamp();
        channel.send({embed}).catch(console.error);
        return;
      }

      let temp = new RichEmbed()
        .setColor(config.colors.main)
        .setTitle('Please wait.')
        .setDescription('Gathering data... <a:loading:401678813605527552>')
        .setTimestamp();
      channel.send({embed: temp}).then(tempMessage => {
        let embed = new RichEmbed()
          .setColor(config.colors.main)
          .addField(currency + '/' + defaultBase, price);
        Object.keys(config.other_base_displays || {}).forEach(base => {
          let baseUpper = base.toUpperCase();
          if (baseUpper !== defaultBase) {
            embed.addField(currency.toUpperCase() + '/' + baseUpper, getPrice(currency, baseUpper, config.other_base_displays[base] || config.default_decimals));
          }
        });
        BinanceAPI.candlesticks(currency + defaultBase, '1d', (ticks, symbol) => {
          let tick = ticks[ticks.length - 1];
          if (tick) {
            embed.addField('24hr High', `${parseFloat(tick[2]).toString()} (${defaultBase})`)
              .addField('24hr Low', `${parseFloat(tick[3]).toString()} (${defaultBase})`)
              .addField('24hr Volume', `${parseFloat(tick[5]).toString()} (${defaultBase})`);
          }
          BinanceAPI.prevDay(currency + (currency === 'BTC' ? 'USDT' : 'BTC'), (prevDay, symbol) => {
            if (prevDay) {
              let percent = parseFloat(parseFloat(prevDay.priceChangePercent).toFixed(2)).toString();
              if (prevDay.priceChangePercent) embed.addField('24hr Change', `${percent}% ${prevDay.priceChangePercent > 0 ? '📈 ⤴' : '📉 ⤵' }`);
            }
            embed.setAuthor('Requested by ' + member.displayName, event.author.avatarURL)
              .setTimestamp();
            tempMessage.edit({embed}).catch(err => handleError(err, tempMessage));
          });
        });
      }).catch(console.error);
    }
  };
};
