const config = require('./config.json');
const request = require('request');

var API_KEY = config.block_io.API_KEY;
var url = 'https://block.io/api/v2?api_key=' + API_KEY;

var methods = {};

var appendVariable = (reqUrl, name, value) => {
  reqUrl += '&' + name + '=' + value;
  return reqUrl;
}

methods.createWallet = (label, callback) => {
  let reqUrl = url;
  reqUrl = appendVariable(reqUrl, 'label', label);
  request.post(reqUrl, (err, res) => {
    callback(res);
  });
}

methods.getWalletBalance = (label, callback) => {
  let reqUrl = url;
  reqUrl = appendVariable(reqUrl, 'labels', label);
  request.post(reqUrl, (err, res) => {
    callback(res);
  });
}

module.exports = methods;
