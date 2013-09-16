var db = require('./db');
console.log('---------------migrate---------------');
db.migrate(function(){
    console.log('----------------done-----------------');
    process.exit();
});