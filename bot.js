const config = require('./config.json');

const Files = require('fs');

const Discord = require('discord.js');
const bot = new Discord.Client();

const BinanceAPI = require('node-binance-api');

// Turn my pretty keys into compatible ones
config.binance.APIKEY = config.binance.api_key;
config.binance.APISECRET = config.binance.api_secret;
BinanceAPI.options(config.binance);

BinanceAPI.prices = {};
getPrices();

function getPrices() {
    BinanceAPI.prices(ticker => {
        prices = ticker;
    });
}
setInterval(getPrices, 5000);

const commands = [];
Files.readdir('./commands/', (err, files) => {
    if (err) {
        console.error(err);
        process.exit(1);
        return;
    }

    files.forEach((file, index) => {
        console.log(file);
        if (file.endsWith('.command.js')) {
            commands.push(require(file));
        }
    });
});

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
        let cmd = args[0];
        args.splice(0, 1);
        event.guild.fetchMember(event.author).then(member => {
            commands.forEach(command => {
                if (command.aliases.indexOf(cmd.toLowerCase()) !== -1) {
                    command.onCommand(event, member, event.channel, args);
                }
            });
        }).catch(console.error);
    }
});

bot.login(config.token);
