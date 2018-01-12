const config = require('./config.json');

const Express = require('express');
const site = Express();

site.get('/callback', (req, res) => res.redirect('https://github.com/Trophonix/Crypton/blob/master/CALLBACK.md'));

site.get('/', (req, res) => {
    if (req.subdomains && req.subdomains.length > 0 && req.subdomains[0].toLowerCase() === 'callback') {
        res.redirect('/callback');
        return;
    }
    res.redirect('https://github.com/Trophonix/Crypton');
});

site.listen(config.port || 5000, () => console.log(`Listening on port ${config.port}`));

require('./bot');
