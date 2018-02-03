const request = require('request');
const url = 'https://block.io/api/v2'

module.exports = (config) => {
  const API_KEY = config.block_io.API_KEY;
  url += '?api_key=' + API_KEY;

  var appendVariable = (reqUrl, name, value) => {
    reqUrl += '&' + name + '=' + value;
    return reqUrl;
  }

  var createWallet = (label, callback) => {
    let reqUrl = url;
    reqUrl = appendVariable(reqUrl, 'label', label);
    request.post(reqUrl, (err, res) => {
      callback(res);
    });
  }

  var getWalletBalance = (label, callback) => {
    let reqUrl = url;
    reqUrl = appendVariable(reqUrl, 'labels', label);
    request.post(reqUrl, (err, res) => {
      callback(res);
    });
  }

}