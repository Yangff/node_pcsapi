var cmdargv = process.argv.splice(2);
var baiduapi = require('./baiduapi');
var db = require('./db');
process.stdin.setEncoding('utf8');
var callnext = {
    nextcall : undefined,
    add : function (next){
        nextcall = next;
        process.stdin.resume();
    },
    received : function(){
        if (nextcall){
            process.nextTick(nextcall);
            nextcall = undefined;
            process.stdin.pause();
        }
    }
};
process.stdin.on('data', function(chunk) {
    callnext.received();
});
process.stdin.pause();
/**
 * 时间对象的格式化;
 */
Date.prototype.format = function(format) {
    /*
     * eg:format="YYYY-MM-dd hh:mm:ss";
     */
    var o = {
        "M+" :this.getMonth() + 1, // month
        "d+" :this.getDate(), // day
        "h+" :this.getHours(), // hour
        "m+" :this.getMinutes(), // minute
        "s+" :this.getSeconds(), // second
        "q+" :Math.floor((this.getMonth() + 3) / 3), // quarter
        "S" :this.getMilliseconds()
    // millisecond
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "")
                .substr(4 - RegExp.$1.length));
    }

    for ( var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}
var controller = {
    help : function(next){
        console.log('pcsvideo admin');
        console.log('node admin [-p port] opinion1 argument1 argument2 ... opinion2 argument1 argument2 ... ');
        console.log('opinions:');
        console.log('  -add (-a)');
        console.log('   add a baidu user to database');
        console.log('    argument1: username');
        console.log('    argument2: password');
        console.log('  -edit (-e)');
        console.log('   edit a baidu user in database');
        console.log('    argument1: username');
        console.log('    argument2: password');
        console.log('  -remove (-r)');
        console.log('   remove a baidu user in database (warning : it will broke old video)');
        console.log('    argument1: username');
        console.log('  -test (-t)');
        console.log('   test a baidu user (will call after a user add to database)');
        console.log('    argument1: username');
        console.log('  -fix (-f)');
        console.log('   if you remove an user , this command will be required');
        console.log('  -list (-l)');
        console.log('   list baidu user you have added into database.')
        console.log('  -help (-h)');
        console.log('   will show this messages');
        if (next) return next();
    },
    add : function(username,password,next){
        baiduapi.baiduLogin(username,password,function(token,cookie){
            if (token == false){
                console.log('[BD] login failed!');
                return next();
            }
            db.BaiduCookie.create({
                username: username,
                password: password,
                cookie  : (cookie),
                express : (Date.now()) + 2 /* years */ * 12 /*month*/ * 30 /*days*/ * 24 /*hours*/ * 60 /*minutes*/ * 60 /* second */ * 1000
            },function(err){
                if (err){
                    console.log('[DB] create failed!');
                    console.log(err);
                }
                return next();
            });
        });
    },
    edit : function(username,password,next){
        db.BaiduCookie.findOne({where:{ username:username }},function(err,user){
            if (err){
                console.log('[DB] find failed!');
                console.log(err);
                return next();
            }
            if (!user){
                console.log('[DB] find failed!');
                return next();
            }
            baiduapi.biduLogin(username,password,function(token,cookie){
                if (token == false){
                    console.log('[BD] login failed!');
                    return next();
                }
                user.cookie = (cookie);
                user.express = (Date.now()) + 2 /* years */ * 12 /*month*/ * 30 /*days*/ * 24 /*hours*/ * 60 /*minutes*/ * 60 /* second */ * 1000;
                user.save(function(err){
                    if (err){
                        console.log('[DB] save failed!');
                        console.log(err);
                    } else console.log('saved ' + user.username);
                    return next();
                });
            });
        });
    },
    remove : function(username,next){
        db.BaiduCookie.findOne({where:{ username:username }},function(err,user){
            if (err){
                console.log('[DB] find failed!');
                console.log(err);
                return next();
            }
            if (!user){
                console.log('[DB] find failed!');
                return next();
            }
            user.destroy(function(err){
                if (err){
                    console.log('[DB] failed destroy');
                    console.log(err);
                } else console.log('destroied ' + user.username);
                return next();
            })
        });
    },
    list : function(next){
        var page = 0;
        var tab = String.fromCharCode(9);
        console.log('user' + tab + 'password' + tab + 'express');
        function display(){
            db.BaiduCookie.all({skip:page*15,limit:15},function(err,users){
                if (err){
                    console.log('[DB] failed query');
                    console.log(err);
                    return next();
                }
                if (!users || users.length == 0)
                    return next();
                users.forEach(function(e){
                  //  console.log(e);
                    console.log(e.username + tab + e.password + tab + e.express.format("yyyy-MM-dd hh:mm:ss"));
                    console.log(e.cookie);
                });
                if (users.length == 15) 
                    callnext.add(display); 
                else 
                    callnext.add(next);
            });
        }
        display();
    },
    test : function(username,next){
        db.BaiduCookie.findOne({where:{ username:username }},function(err,user){
            if (err){
                console.log('[DB] find failed!');
                console.log(err);
                return next();
            }
            if (!user){
                console.log('[DB] find failed!');
                return next();
            }
            baiduapi.baiduLogin(user.username,user.password,function(token,cookie){
                if (token == false){
                    console.log('[BD] login failed!');
                    return next();
                }

                user.cookie = (cookie);
                user.express = (Date.now()) + 2 /* years */ * 12 /*month*/ * 30 /*days*/ * 24 /*hours*/ * 60 /*minutes*/ * 60 /* second */ * 1000;
                user.save(function(err){
                    if (err){
                        console.log('[DB] save failed!');
                        console.log(err);
                    } else console.log('test success . saved ' + user.username);
                    return next();
                });
            });
        });
    },
    testall : function(next){
        db.BaiduCookie.all(function(err,users){
            var pos = 0;
            function nextCommand(){
                function next2(){
                    pos += 1;
                    if (pos < users.length)
                        process.nextTick(nextCommand);
                    else
                        next();
                };
                controller.test(users[pos].username,next2);
            } nextCommand();
        });
    }
}

var arglen = {
    '-add' : 2,
    '-a' : 2,
    '-edit' : 2,
    '-e' : 2,
    '-remove' : 1,
    '-r' : 1,
    '-test' : 1,
    '-t' : 1,
    '-fix' : 0,
    '-f' : 0,
    '-list':0,
    '-l':0,
    '-help' : 0,
    '-h' : 0
}

if (cmdargv.length==0){
    controller.help();
    process.exit(0);
}
var port = null;
var start = 0;
if (cmdargv[0]=='-p'){
    start += 2;
    port = parseInt(cmdargv[1]);
    if (port == 0){
        console.log('bad request of port');
        controller.help();
        process.exit(0);
    }
}
baiduapi.start(port);
var pos = start;
//for (var pos = start; pos < cmdargv.length; pos+=arglen[cmdargv[pos]] + 1){
function nextCommand(){
    function next(){
        pos += arglen[cmdargv[pos]] + 1;
        if (pos < cmdargv.length)
            process.nextTick(nextCommand);
        else
            process.exit(0);
    }
    if (arglen[cmdargv[pos]] == null) {
        console.log('unknown command `' + cmdargv[pos] + "' in " + pos);
        cmdargv[pos] = '-h';
    }
    if (cmdargv[pos] == '-add' || cmdargv[pos] == '-a'){
        controller.add(cmdargv[pos+1],cmdargv[pos+2],next);
    }
    if (cmdargv[pos] == '-edit' || cmdargv[pos] == '-e'){
        controller.edit(cmdargv[pos+1],cmdargv[pos+2],next);
    }
    if (cmdargv[pos] == '-remove' || cmdargv[pos] == '-r'){
        controller.remove(cmdargv[pos+1],next);
    }
    if (cmdargv[pos] == '-test' || cmdargv[pos] == '-t'){
        //unsupport yet
        // TODO: try to login with user..
        // return next();
        if (cmdargv[pos+1] == 'all') {
            controller.testall(next);
        } else {
            controller.test(cmdargv[pos+1],next);
        }
        
    }
    if (cmdargv[pos] == '-fix' || cmdargv[pos] == '-f'){
        //unsupport yet
        // TODO :move files in removed user to other user
        return next();
        controller.fix(next);
    }
    if (cmdargv[pos] == '-list' || cmdargv[pos] == '-l'){
        controller.list(next);
    }
    if (cmdargv[pos] == '-help' || cmdargv[pos] == '-h'){
        controller.help(next);
    }
//}
} nextCommand();