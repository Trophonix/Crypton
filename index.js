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

global.cache = {};

function getPrices () {
  BinanceAPI.prices(ticker => {
    Object.keys(ticker).forEach(market => {
      global.cache[market] = {
        price: ticker[market]
      };
    });
    // BittrexAPI.getmarketsummaries((data, err) => {
    //   if (err) return console.error(err);
    //   data.result.forEach(marketData => {
    //     let split = marketData.MarketName.split('-');
    //     let market = (split[1] + split[0]).toUpperCase();
    //     let existing = global.cache[market];
    //     if (existing) {
    //       existing.price += marketData.Last;
    //       existing.price /= 2;
    //       existing.volume = marketData.Volume;
    //       existing.high = marketData.High;
    //       existing.low = marketData.Low;
    //       existing.change = -(((marketData.PrevDay - marketData.Last) / marketData.PrevDay) * 100);
    //     } else {
    //       global.cache[market] = {
    //         price: marketData.Last,
    //         volume: marketData.Volume,
    //         high: marketData.High,
    //         low: marketData.Low,
    //         change: -(((marketData.PrevDay - marketData.Last) / marketData.PrevDay) * 100)
    //       };
    //     }
    //   });
    // });
  });
}
getPrices();
setInterval(getPrices, 60 * 1000);

const Express = require('express');
const site = Express();

site.get('/support', (req, res) => res.redirect('https://discord.gg/MrFsSVe'));

site.get('/callback', (req, res) => res.redirect('https://github.com/Trophonix/Crypton/blob/master/CALLBACK.md'));

site.get('/add', (req, res) => res.redirect('https://discordapp.com/oauth2/authorize?client_id=401249077657993246&scope=bot&permissions=388160&redirect_url=crypton.fun/callback'));

site.get('/', (req, res) => res.redirect('https://github.com/Trophonix/Crypton'));

site.listen(config.port || 5000, () => console.log(`Listening on port ${config.port}`));

require('./bot');
