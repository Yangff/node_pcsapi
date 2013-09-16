var http = require("http");
var https = require("https");
var config = require("./config");
var controller = require("./controller");
var url = require('url'); 
var fs = require('fs');

/*
    /           #=> status
    /get/md5.json
    returns
        {scuess:true/false
            body:{
                type: "mp4",
                size: xxxxx,
                url : "",
                ]
            }
        }
    # open only
    /add    #=> upload and hit ++
    code:
    base64edjson{
        type:'md5'/'uksk'
        uk:xxx,
        sk:xxx
        or 
        md5:'length:smd5:md5:crc32'
    }
    returns
        {
            scuess:true/false,
            body :{
                md5 : ""
            }
        }
    /delete #=> hit-- and check upload 
    !!WARN!! it will not delete any data!!!
    code:
        md5

*/
if (config.load()){
    var service = config.get('ssl')?https:http;
    service.createServer(function(req,res){
        var path = url.parse(req.url);
        /*if (path.pathname.split('/')[1]=='add'){
            controller.add(req,res);
            return ;
        }*/
        //if (path.pathname.split('/')[1]=='delete'){
            /* res.write(JSON.stringify({
                'error':-1,
                'msg':'unsupport action'
            }));
            res.end; */
        //    controller.delete(req,res);
        //    return ;
        //}
        
        if (path.pathname.split('/')[1]=='get' && (path.pathname.split('/')[2] || "") != ""){
            controller.get(req,res,path.pathname.split('/')[2]);
            return ;
        }
        res.writeHead(404, {"Content-Type": "application/json"});
        res.write(JSON.stringify({
            'error':-1,
            'msg':'unsupport action',
            body : {}
        }));
        res.end();
    }).listen(2233);
    var options = {
        key:    fs.readFileSync('./ssl/server.key'),
        cert:   fs.readFileSync('./ssl/server.crt'),
        ca:     fs.readFileSync('./ssl/ca.crt'),
        requestCert:        true,
        rejectUnauthorized: false
    };
    https.createServer(options,function (req,res){
        var path = url.parse(req.url);
        if (req.client.authorized) {
            if (path.pathname.split('/')[1]=='get' && (path.pathname.split('/')[2] || "") != ""){
                controller.get(req,res,path.pathname.split('/')[2]);
                return ;
            }
            if (path.pathname.split('/')[1]=='add' && (path.pathname.split('/')[2] || "") != ""){
                controller.add(req,res,path.pathname.split('/')[2] );
                return ;
            }
            if (path.pathname.split('/')[1]=='delete' && (path.pathname.split('/')[2] || "") != ""){
                controller._delete(req,res,path.pathname.split('/')[2]);
                return ;
            }
            res.writeHead(404, {"Content-Type": "application/json"});
            res.write(JSON.stringify({
                'error':-1,
                'msg':'unsupport action',
                'url' : req.url,
                body : {}
            }));
            res.end();
        } else {
            res.writeHead(401, {"Content-Type": "application/json"});
            res.write(JSON.stringify({
                'error':-1,
                'msg':'access forbidden',
                body : {}
            }));
            res.end();
        }
    }).listen(2234);
}


// cookies

