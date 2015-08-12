var b64url = require('b64url'),
  crypto = require('crypto'),
  config = require('config'),
  util = require('util'),
  Q = require('q');

config.util.setModuleDefaults('signedObject', {});

function Vault( options ) {
  if (!(this instanceof Vault)) {
    return new Vault(this);
  }

  this.options = config.util.extendDeep({}, config.signedObject, options);
};

Vault.prototype.sign = function( data ) {
  var options = this.options,
    secret = options.secret,
    ttl = options.ttl;

  if (typeof secret === 'function') {
    return Q.nfcall(secret, data).then(function( secret ) {
      return new Vault({
        secret: secret,
        ttl: ttl
      }).sign(data);
    });
  }

  var payload = {};
  if (ttl) {
    payload.expires = Date.now() + ttl;
  }
  util._extend(payload, data);

  var body = b64url.encode(JSON.stringify(payload)),
    hmac = crypto.createHmac('SHA256', secret).update(body),
    signature = b64url.safe(hmac.digest('base64'));

  return signature + '.' + body;
};

Vault.prototype.verify = function( data ) {
  var options = this.options,
    secret = options.secret,
    ttl = options.ttl;

  if (typeof secret === 'function') {
    return Q.nfcall(secret, this.inspect(data)).then(function( secret ) {
      return new Vault({
        secret: secret,
        ttl: ttl
      }).verify(data);
    });
  }

  var i = data && data.indexOf('.');
  if (i) {
    var signature = data.slice(0, i),
      body = data.slice(i + 1),
      hmac = crypto.createHmac('SHA256', secret);

    hmac.update(body);

    if (b64url.safe(hmac.digest('base64')) === signature) {
      var payload = JSON.parse(b64url.decode(body));

      if (!payload.hasOwnProperty('expires') || payload.expires > Date.now()) {
        delete payload.expires;
        return payload;
      }
    }
  }
};

Vault.prototype.inspect = function( data ) {
  var i = data && data.indexOf('.');

  if (i) {
    var body = data.slice(i + 1),
      payload = JSON.parse(b64url.decode(body));

    return payload;
  }
}

module.exports = Vault;