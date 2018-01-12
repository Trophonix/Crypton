const config = require('./config.json');

const Express = require('express');
const site = Express();

site.get('/callback', (req, res) => res.redirect('https://github.com/Trophonix/Crypton/blob/master/CALLBACK.md'));

site.get('/add', (req, res) => res.redirect('https://discordapp.com/oauth2/authorize?client_id=401249077657993246&scope=bot&permissions=388160&redirect_uri=callback.crypton.fun'));

site.get('/', (req, res) => res.redirect('https://github.com/Trophonix/Crypton'));

site.listen(config.port || 5000, () => console.log(`Listening on port ${config.port}`));

require('./bot');
