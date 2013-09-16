var jugglingdb = require('jugglingdb');
var Schema = jugglingdb.Schema;
var config = require('./config');
var get = config.get;
var prefix = get('prefix');
var schema = new Schema(
    get('sqltype'),
    {
        port:get('port'),
        host:get('host'),
        username:get('username'),
        password:get('password'),
        database:get('database')
    }
);
var BaiduCookie = exports.BaiduCookie = schema.define(
    prefix + '_baiduCookies',
    {
        username : { type: String , index: true } ,
        password : String ,
        cookie   : { type:Schema.JSON , limit: 1000},
        express  : Date
    }
);
var SavedFile = exports.SavedFile = schema.define(
    prefix + '_savedFiles',
    {
        identity   : { type: String , index: true },
    //    hit        : { type: Number , default: 1  },
    //    queryTimes : { type: Number , default: 1  },
    //    saveUser   : { type: String , index: true },
        joinTime   : { type: Date   , default: function(){ return Date.now();}},
        lastHit    : { type: Date   , default: function(){ return Date.now();}},
        size       : Number,
        fs_id      : { type: Number , index:true , limit:64 },
    }
);
SavedFile.validatesUniquenessOf('identity', {message: 'identity is not unique'});
SavedFile.validatesUniquenessOf('fs_id', {message: 'fs_id is not unique'});
BaiduCookie.validatesUniquenessOf('username', {message: 'username is not unique'});

BaiduCookie.hasMany(SavedFile , {as: 'files',  foreignKey: 'fileid'});
SavedFile.belongsTo(BaiduCookie , {as: 'disk', foreignKey: 'fileid'});
exports.migrate = function(next){
    return schema.automigrate(next);
}