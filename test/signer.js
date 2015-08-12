var Vault = require('../index'),
  faker = require('faker'),
  util = require('util');

describe('Signed Object', function() {
  it('Signs & Verifies objects', function() {
    var vault = new Vault(),
      user = faker.helpers.userCard(),
      signed = vault.sign(user),
      verified = vault.verify(signed);

    assert.deepEqual(user, verified);
  });

  it('Respects TTL', function() {
    var user = util._extend({
      expires: Date.now()
    }, faker.helpers.userCard());

    var vault = new Vault(),
      signed = vault.sign(user),
      verified = vault.verify(signed);

    assert.isUndefined(verified);
  });

  it('Inspects objects', function() {
    var vault = new Vault(),
      user = faker.helpers.userCard(),
      signed = vault.sign(user),
      payload = vault.inspect(signed);

    delete payload.expires;
    assert.deepEqual(user, payload);
  });

  it('Secret lookup', function() {
    var vault = new Vault({
      secret: function( data, cb ) {
        cb(null, data.key);
      },
      ttl: 1000
    });

    var user = util._extend({
      key: faker.random.uuid()
    }, faker.helpers.userCard());

    return vault.sign(user).then(function( signed ) {
      return vault.verify(signed);
    }).then(function( payload ) {
      assert.deepEqual(user, payload);
    });
  });
});