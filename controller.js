var db = require('./db');
var pcsapi = require('./pcsapi.js').PCS;

function passerr(err,res,next){
    if (err) {
        res.writeHead(500, {"Content-Type": "application/json"});
        res.end(JSON.stringify({
            error : -2,
            msg : err,
            body : {}
        }));
       // res.end();
    } else return next();
}
exports.add = function(req,res,key){
    db.SavedFile.count({ identity:key },function(err,count){
        if (count == 0) {
            db.BaiduCookie.count(function(err , count){
                if (count){
                    passerr(err,res,function (){
                        var x = Math.floor(Math.random() * count) + 1;
                        db.BaiduCookie.find(x,function(err , instance){
                            passerr(err,res,function (){
                                var cookie = instance.cookie;
                                pcsapi.upload(cookie,key,function(rst){
                                    rst  = JSON.parse(rst);
                                    if (rst.error_code){
                                       // console.log("X");
                                        res.writeHead(500, {"Content-Type": "application/json"});
                                        res.end(JSON.stringify({
                                            error : -3,
                                            msg : rst,
                                            body : {}
                                        }));
                                    } else {
                                        
                                        instance.files.create({
                                            identity : key, 
                                            size     : rst.size,
                                            fs_id    : rst.fs_id
                                        },function(err){
                                            passerr(err,res,function (){
                                                res.writeHead(200, {"Content-Type": "application/json"});
                                                res.end(JSON.stringify({
                                                    error : 0,
                                                    msg : "",
                                                    body : {
                                                        succ:true,
                                                        status:'add'
                                                    }
                                                }));
                                            });
                                        });
                                    }
                                });
                            });
                        });
                    });
                }
                else
                {
                    res.writeHead(404, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({err:-6,msg : "no disk found.",body:{}}));
                }
            });
        }
        else
        {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({err:0,msg : "",body:{succ:true,status:"hit",times:count}}));
        }
    });
}
exports.get = function(req,res,key){

    db.SavedFile.findOne({where:{ identity:key }},function(err,instance){
        if (instance == null) {
            res.writeHead(404, {"Content-Type": "application/json"});
            res.end(JSON.stringify({err:-3,msg : "file not found.",body:{}}));
            return;
        }
        instance.disk(function(err,disk){
           // console.log("A");
            passerr(err,res,function(){
                pcsapi.download(disk.cookie,key,function(rst){
                    rst = JSON.parse(rst);
                    // console.log(rst);
                    if (rst.errno != 0 || rst.list.length == 0){
                        res.end(JSON.stringify({err:-4,msg : "file not found.",body:{}}));
                        return ;
                    }
                    for (var x = 0; x < rst.list.length; x++){
                        if (rst.list[x].fs_id == instance.fs_id){
                            res.writeHead(200, {"Content-Type": "application/json"});
                            res.end(JSON.stringify({
                                err: 0,
                                msg: "",
                                body: {
                                    succ: true,
                                    status: 'hit',
                                    type: "mp4",
                                    size: rst.list[x].size,
                                    url: rst.list[x].dlink,
                                    thumbs: rst.list[x].thumbs
                                }
                            }));
                            return ;
                        }
                    }
                    res.writeHead(404, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({err:-5,msg : "file not found.",body:{}}));
                });
            });
        });
    });
}
exports._delete = function(req,res,key){
    db.SavedFile.findOne({where:{ identity:key }},function(err,instance){
        if (instance == null) {
            res.writeHead(404, {"Content-Type": "application/json"});
            res.end(JSON.stringify({err:-3,msg : "file not found.",body:{}}));
            return;
        }
        instance.disk(function(err,disk){
            passerr(err,res,function(){
                pcsapi._delete(disk.cookie,key,function (succ){
                    if (succ){
                        instance.destroy(function (err){
                            passerr(err,res,function(){
                                res.writeHead(200, {"Content-Type": "application/json"});
                                res.end(JSON.stringify({err:0,msg : "",body:{succ:true,status:"okay"}}));
                            });
                        });
                    } else {
                        res.writeHead(500, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({err:-5,msg : "Cannot delete file.",body:{}}));
                    }
                });
            });
        });
    });
}