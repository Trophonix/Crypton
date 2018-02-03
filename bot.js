const config = require('./config.json');

const Files = require('fs');

const Discord = require('discord.js');
const bot = new Discord.Client();

bot.commands = [];
Files.readdir('./commands/', (err, files) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  files.forEach((file, index) => {
    console.log(file);
    if (file.endsWith('.command.js'))
      bot.commands.push(require('./commands/' + file)(bot, config));
  });
});

function updatePresence() {
  let guilds = bot.guilds ? bot.guilds.array().length : 0;
  bot.user.setPresence({
    status: 'online',
    game: {
      name: `in ${guilds} guild${guilds === 1 ? '' : 's'} | ${
        config.prefix
      }help`
    }
  });
}

bot.on('ready', () => {
  updatePresence();
  console.log('Connected to discord.');
});

bot.on('guildCreate', guild => updatePresence());
bot.on('guildDelete', guild => updatePresence());

const getMember = async (event) => {
  return new Promise(resolve => {
    if (event && event.guild) {
      event.guild.fetchMember(event.author).then(resolve);
    } else {
      resolve(null);
    }
  });
}

bot.on('message', event => {
  let message = event.content.toLowerCase();
  if (message.startsWith(config.prefix)) {
    message = message.replace(config.prefix, '');
    let args = message.split(' ');
    let cmd = args[0];
    args.splice(0, 1);
    (async () => {
      let member = await getMember(event);
      bot.commands.forEach(command => {
        if (command.aliases.indexOf(cmd.toLowerCase()) !== -1) {
          console.log(
            `[${event.guild.name} (${event.guild.id})] ${
              event.author.username
            }#${event.author.discriminator}: ${
              config.prefix
            }${cmd} ${args.join(' ')}`
          );
          if (member || command.allowDM) {
            command.onCommand(event, member, event.channel, args);
          }
        }
      });
    })();
  }
});

bot.login(config.token);
