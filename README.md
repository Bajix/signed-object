# **Signed Object**

A [config](https://www.npmjs.com/package/config) driven tool for signing objects, using the same algorithm implemented by Facebook.

[![Version npm](https://img.shields.io/npm/v/signed-object.svg?style=flat-square)](https://www.npmjs.com/package/signed-object)[![Support via Gratipay](https://img.shields.io/gratipay/Bajix.svg)](https://gratipay.com/Bajix)[![NPM Downloads](https://img.shields.io/npm/dm/signed-object.svg?style=flat-square)](https://www.npmjs.com/package/signed-object)[![Build Status](https://img.shields.io/codeship/0e5f6c30-2376-0133-c215-3205d6dcf9b5.svg)](https://codeship.com/projects/96472)[![Dependencies](https://img.shields.io/david/Bajix/signed-object.svg?style=flat-square)](https://david-dm.org/Bajix/signed-object)

## Install

[![NPM](https://nodei.co/npm/signed-object.png?downloads=true&downloadRank=true)](https://nodei.co/npm/signed-object/)

```bash
$ npm install signed-object --save
```

## Documentation

### 'new Vault(options)'

`options` *{Object}*

Optional. This defaults to your `config.signedObject` options, and is extended by the passed options. Hence, this can be entirely maintained solely within your config settings.

- `secret` *{String OR Function}*

The secret is used a cryptographic [HMAC key](https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key). This ensures that your payload cannot be tampered with, as any changes will result in a signature that doesn't match the one produced against your secret.

If a function is passed as the secret, every time sign or verify are invoked, the secret function will be called with the signature (`data`, `cb`), where data is the object being signed or verified. For example, this could be used to lookup a secret based off of a key present in your object. When using a function instead of a string, sign and verify both will return [promises](https://github.com/kriskowal/q/wiki/API-Reference).

- `ttl` *{Number}*

Optional. If present, any signed object that doesn't already contain an expires property will be appended with a Unix Timestamp relative to the current time, and TTL (Time to Live). This uses milliseconds.


### `Vault.prototype.sign(data)`

Sign the given object, according to options. This will return a string that can be publicly passed around and later verified securely.

### `Vault.prototype.verify(data)`

Sign the given string, according to options. This will return an object if valid, otherwise undefined.

### `Vault.prototype.inspect(data)`

inspects the given signed string, returning it's body as an object regardless of wether it's valid.

## Example A

```
// .
// ├── config
// │   ├── default.json
// │   └── test.json

// test.json
// {
//  ...
//   "signedObject" : {
//     "secret" : "2xYJR\"&QNV6#t4B23*W4Yv5$\"TL),aLsTz9H0(v8d0+zJO8ulw4v495haK*'RD1b",
//     "ttl" : 3600000
//   },
//   ...
// }

var vault = require('signed-object')();

var signed = vault.sign({
  decree: "Install me... and tip",
}); // 'zRWK61EWt66RgLlERkW7sxzJhmb7Rfvax67beDnPXd8.eyJleHBpcmVzIjoxNDM5NDI5Mzg2NzMyLCJkZWNyZWUiOiJJbnN0YWxsIG1lLi4uIGFuZCB0aXAifQ'

var verified = vault.verify(signed);
```

Example B

```
var client = require('redis-client-pool').utility;

var vault = require('signed-object')({
  secret: function( data, cb ) {
    client.hget('partner:keys', data.key, cb);
  }
});

...

vault.sign({
  decree: "I'm a little tea pot",
  key: 'https://gratipay.com/Bajix' // fill me up
}).nodeify(cb);

...

vault.verify(signed).nodeify(cb);
```