var config = {
    // baidu access data
    'deal' : 0,
    // sql access data
    'sqltype' : '', 
    'host' : '',
    'username' : '',
    'password' : '',
    'port'     : '',
    'database' : '',
    'prefix'   : '',
    // service
    'ssl'      : false
};
var fs = require("fs");
var loaded = false;
exports.load = function load(){
    if (loaded) return true;
   /* if (! fs.exists('./config.json')){
        console.log('./config.json is not exists.')
        return false;
    } */
    var cfg = fs.readFileSync('./config.json');
    cfg = JSON.parse(cfg);
    config['ak'] = String(cfg['ak']);
    config['sk'] = String(cfg['sk']);
    config['deal'] = parseInt(cfg['deal']);
    config['sqltype'] = String(cfg['sqltype']);
    config['host'] = String(cfg['host']);
    config['username'] = String(cfg['username']);
    config['password'] = String(cfg['password']);
    config['port'] = String(cfg['port']);
    config['database'] = String(cfg['database']);
    config['prefix'] = String(cfg['prefix']);

    config['secret'] = String(cfg['secret']);
    if (String(cfg['ssl'])=='true') config['ssl'] = true;
    else
        if (String(cfg['ssl'])=='false') config['ssl'] = false;
            else
            {
                console.log('bad ssl value');
                return false;
            }
    loaded = true;
    return true;
}
function check_x(x){
    if (x == 'ak'       ||
        x == 'sk'       ||
        x == 'deal'     ||
        x == 'sqltype'  ||
        x == 'host'     ||
        x == 'username' ||
        x == 'password' ||
        x == 'port'     ||
        x == 'database' ||
        x == 'prefix'   ||
        x == 'open'     ||
        x == 'secret'   ||
        x == 'ssl'
    )
        return true;
    return false;
}
exports.get = function get(x){
    if (!check_x(x)) return false;
    return config[x];
}

if (!loaded) exports.load();