var assert = require('assert');
var Waterline = require('../../../lib/waterline');

describe('Before Create Lifecycle Callback ::', function() {
  describe('.createEach() ::', function() {
    var person;

    before(function(done) {
      var waterline = new Waterline();
      var Model = Waterline.Model.extend({
        identity: 'user',
        connection: 'foo',
        primaryKey: 'id',
        fetchRecordsOnCreate: true,
        attributes: {
          id: {
            type: 'number'
          },
          name: {
            type: 'string'
          }
        },

        beforeCreate: function(values, cb) {
          values.name = values.name + ' updated';
          cb();
        }
      });

      waterline.registerModel(Model);

      // Fixture Adapter Def
      var adapterDef = { createEach: function(con, query, cb) { return cb(null, query.newRecords); }};

      var connections = {
        'foo': {
          adapter: 'foobar'
        }
      };

      waterline.initialize({ adapters: { foobar: adapterDef }, datastores: connections }, function(err, orm) {
        if (err) {
          return done(err);
        }
        person = orm.collections.user;
        return done();
      });
    });

    it('should run beforeCreate and mutate values', function(done) {
      person.createEach([{ name: 'test-foo', id: 1 }, { name: 'test-bar', id: 2 }], function(err, users) {
        if (err) {
          return done(err);
        }

        assert.equal(users[0].name, 'test-foo updated');
        assert.equal(users[1].name, 'test-bar updated');
        return done();
      }, {fetch: true});
    });
  });
});
