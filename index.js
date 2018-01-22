const config = require('./config.json');

const BinanceAPI = require('node-binance-api');

// Turn my pretty keys into compatible ones
config.binance.APIKEY = config.binance.api_key;
config.binance.APISECRET = config.binance.api_secret;
BinanceAPI.options(config.binance);

BinanceAPI.cache = {};
getPrices();

function getPrices () {
  BinanceAPI.prices(ticker => {
    BinanceAPI.cache = ticker;
  });
}
setInterval(getPrices, 5000);

const Express = require('express');
const site = Express();

site.get('/support', (req, res) => res.redirect('https://discord.gg/MrFsSVe'));

site.get('/callback', (req, res) => res.redirect('https://github.com/Trophonix/Crypton/blob/master/CALLBACK.md'));

site.get('/add', (req, res) => res.redirect('https://discordapp.com/oauth2/authorize?client_id=401249077657993246&scope=bot&permissions=388160&redirect_url=crypton.fun/callback'));

site.get('/', (req, res) => res.redirect('https://github.com/Trophonix/Crypton'));

site.listen(config.port || 5000, () => console.log(`Listening on port ${config.port}`));

require('./bot');
