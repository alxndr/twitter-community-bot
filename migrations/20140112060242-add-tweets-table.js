var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, done) {
  db.createTable('tweets', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, notNull: true, unique: true }
    ,author: { type: 'string', notNull: true }
    ,text: { type: 'string', notNull: true }
    // might as well...
    ,created_at: { type: 'datetime', notNull: true }
    //,updated_at: 'datetime'
  });

  done();
};

exports.down = function(db, done) {
  db.dropTable('tweets');

  done();
};
