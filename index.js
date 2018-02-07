const config = require('./config.json');

const BinanceAPI = require('node-binance-api');

// Turn my pretty keys into compatible ones
config.exchanges.binance.APIKEY = config.exchanges.binance.api_key;
config.exchanges.binance.APISECRET = config.exchanges.binance.api_secret;
BinanceAPI.options(config.exchanges.binance);

config.exchanges.bittrex.apikey = config.exchanges.bittrex.api_key;
config.exchanges.bittrex.apisecret = config.exchanges.bittrex.api_secret;
const BittrexAPI = require('node-bittrex-api');
BittrexAPI.options(config.exchanges.bittrex);

const cache = require('./cache');

function getPrices() {
  BinanceAPI.prevDay(null, tickers => {
    tickers.forEach(data => {
      Object.keys(data).forEach(key => {
        let value = data[key];
        if (typeof value === 'string') {
          let float = parseFloat(value);
          if (float != null && !isNaN(float)) {
            data[key] = float;
          }
        }
      });
      cache[data.symbol] = {
        price: data.weightedAvgPrice,
        volume: data.volume,
        high: data.highPrice,
        low: data.lowPrice,
        change: data.priceChangePercent
      };
    });
    BittrexAPI.getmarketsummaries((data, err) => {
      if (err) return console.error(err);
      data.result.forEach(marketData => {
        let split = marketData.MarketName.split('-');
        let market = (split[1] + split[0]).toUpperCase();
        Object.keys(marketData).forEach(key => {
          let value = marketData[key];
          if (typeof value === 'string') {
            let float = parseFloat(value);
            if (float != null && !isNaN(float)) {
              marketData[key] = float;
            }
          }
        });
        let existing = cache[market];
        if (existing) {
          existing.volume = marketData.Volume;
          existing.high = marketData.High;
          existing.low = marketData.Low;
          existing.change = -(
            (marketData.PrevDay - marketData.Last) /
            marketData.PrevDay *
            100
          );
        } else {
          cache[market] = {
            price: marketData.Last,
            volume: marketData.Volume,
            high: marketData.High,
            low: marketData.Low,
            change: -(
              (marketData.PrevDay - marketData.Last) /
              marketData.PrevDay *
              100
            )
          };
        }
      });
    });
  });
}
getPrices();
setInterval(getPrices, 60 * 1000);

const Express = require('express');
const site = Express();

site.get('/support', (req, res) => res.redirect('https://discord.gg/MrFsSVe'));

site.get('/callback', (req, res) =>
  res.redirect('https://github.com/Trophonix/Crypton/blob/master/CALLBACK.md')
);

site.get('/add', (req, res) =>
  res.redirect(
    'https://discordapp.com/oauth2/authorize?client_id=401249077657993246&scope=bot&permissions=388160&redirect_url=crypton.fun/callback'
  )
);

site.get('/', (req, res) =>
  res.redirect('https://github.com/Trophonix/Crypton')
);

site.listen(config.port || 5000, () =>
  console.log(`Listening on port ${config.port}`)
);

require('./bot');
