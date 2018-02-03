const config = require('./config.json');
const request = require('request');

var API_KEY = config.block_io.API_KEY;
var SECRET = config.block_io.SECRET;
var url = 'https://block.io/api/v2';

var methods = {};

var appendVariable = (reqUrl, name, value) => {
  reqUrl += '&' + name + '=' + value;
  return reqUrl;
}

methods.createWallet = (label, callback) => {
  let reqUrl = url + '/get_new_address?api_key=' + API_KEY;
  reqUrl = appendVariable(reqUrl, 'label', label);
  request.post(reqUrl, (err, res) => {
    callback(res.body);
  });
}

methods.getWalletBalance = (label, callback) => {
  let reqUrl = url + '/get_address_by_label?api_key=' + API_KEY;
  reqUrl = appendVariable(reqUrl, 'label', label);
  request.post(reqUrl, (err, res) => {
    callback(res.body);
  });
}

methods.getWallet = (user, callback) => {
  methods.getWalletBalance(user.id, res => {
    res = JSON.parse(res.replace(/\n/g, ''));
    if (res && res.status === 'success' && res.data) {
      callback(res.data);
    } else {
      methods.createWallet(user.id, _res => {
        methods.getWalletBalance(user.id, res1 => {
          res1 = JSON.parse(res1.replace(/\n/g, ''));
          if (res1) callback(res1.data);
          else callback(null);
        });
      });
    }
  });
}

methods.send = (from, to, amount, callback) => {
  let reqUrl = url + '/withdraw_from_labels?api_key=' + API_KEY;
  reqUrl = appendVariable(reqUrl, 'from_labels', from);
  reqUrl = appendVariable(reqUrl, 'to_labels', to);
  reqUrl = appendVariable(reqUrl, 'amounts', amount);
  reqUrl = appendVariable(reqUrl, 'pin', SECRET);
  request.post(reqUrl, (err, res) => {
    res.body = JSON.parse(res.body.replace(/\n/g, ''));
    callback(res.body);
  });
}

module.exports = methods;
