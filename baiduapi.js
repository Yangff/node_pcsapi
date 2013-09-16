var requestify = require('requestify');
var querystring = require("querystring");
var http = require('http');
var https = require('https');
var url = require('url'); 
var verify = {};
var serverstart = false;
var baiduhelper = {
    firstpass:function(){ return {url:'http://www.baidu.com'};},
    getapi:function(){return {url:'https://passport.baidu.com/v2/api/?getapi&tpl=mn&apiver=v3&class=login&tt=' + (new Date()).getTime() +'&logintype=dialogLogin&callback=biduapi'};},
    logincheck:function(token,username){
        return {url:'https://passport.baidu.com/v2/api/?logincheck&token=' + token + '&tpl=mn&apiver=v3&tt=' + (new Date()).getTime() + '&username=' + username + '&isphone=false&callback=bidu_yooo'};
    },
    login : function(token,username,password,codestring,verifycode){
        return {
            url:'https://passport.baidu.com/v2/api/?login',
            post:{
                staticpage:'http://www.baidu.com/cache/user/html/v3Jump.html',
                charset:'UTF-8', 
                token:token,
                tpl:'mn',
                apiver:'v3',
                tt:(new Date()).getTime(),
                codestring:codestring,
                isPhone:false,
                safeflg:0,
                u:'http://www.baidu.com/',
                quick_user:0,
                usernamelogin:1,
                splogin:'rate',
                username:username,
                password:password,
                verifycode:verifycode,
                mem_pass:'on',
                ppui_logintime:parseInt(Math.random() * 3000+7000),
                callback:'bd__pcbs__cb'
            }
        };
    },
    genimg : function (token){
        return {
            url:"https://passport.baidu.com/cgi-bin/genimage?" + token
        };
    }
};
function parseCookie(c){
    var cookie = {}
    for (var i = 0; i < c.length; i++){
        //console.log(c[i]);
        var x = c[i].split(';')[0];
        var y = x.split('=');
        //console.log(y);
        var z = "";
        for (var j = 1; j < y.length; j++) {
            if ( j != 1) z+='=';
            z += y[j];
        }
        y = y[0];
        cookie[y] = z;
    }
    return cookie;
}
function gentoken(len) {
    len = len || 32;
    var $chars = 'qwertyuioplkjhgfdszxcvbnmQAZWSXEDCRFVTGBYHNUJMIKOLP1234567890'; 
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}
function final(cookie,token,u,p,next,codestring,verifycode){
    var uri = baiduhelper.login(token,u,p,codestring,verifycode);
    requestify.post(uri.url,uri.post,{
        cookies : cookie,
        dataType : 'form-url-encoded'
    }).then(function (res){
        
        var body = res.getBody();
       // console.log(res.getBody());
        if (body.indexOf('bd__pcbs__cb') == -1){
            next(false,"failed login");
            return ;
        }
        if (body.indexOf('err_no=4')!= -1){
            next(false,"bad password");
            return ;
        }
        //  console.log(body);
        if ((body.indexOf('err_no=257')!= -1) || (body.indexOf('err_no=6') != -1)){
            // codeString
           // console.log(body);
            if (!serverstart){
                next(false,"Please start verifycode server!");
                return ;
            }
            //console.log("[FUCK]!!!code string is required!!!");
            var e = /\?[^"]*/;
            var query = (e.exec(body)).toString().split('?')[1];
            //console.log(query);
            query = querystring.parse(query);

            var et = gentoken(8);
            //requestify.get(baiduhelper.genimg(query['codeString']).url,{ cookies : cookie })
           // .then(function(res){
               // var img = res.getBody();
                console.log("need input verifycode");
                verify[et] = function(req,res){
                    var path = url.parse(req.url);
                    var query1 = querystring.parse(path.query);
                    if (query1.aq == 'jpg'){
                       // console.log(baiduhelper.genimg(query['codeString']).url);
                        res.writeHead(302, {'Location': baiduhelper.genimg(query.codeString).url});
                        res.end();
                        return;
                    }else
                    if (query1.aq == 'ok'){
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.end("received");
                        delete verify[et];
                        
                        final(cookie,token,u,p,next,query.codeString,query1.code);
                        return ;
                    }else{
                        res.writeHead(404, {'Content-Type': 'text/html'});
                        res.end("cannot find the page");
                    }
                };
           //}).fail(function(){
            //    console.log("cannot get img");
            //});
            return ;
        }
        var c = parseCookie(res.getHeader('set-cookie'));
       // console.log(c);
        var newcookie = {
            'BAIDUID' : c['BAIDUID'] || cookie['BAIDUID'],
            'H_PS_PSSID' : c['H_PS_PSSID'] || cookie['H_PS_PSSID'],
            'BDUSS' : c['BDUSS'] || cookie['BDUSS']
        };
        next(token,newcookie);
    }).fail(function (err){
        console.log(err);
    });
}
exports.baiduLogin = function(u,p,next){/* next(token,cookie(error)) */
    var cookie = {};
    requestify.get(baiduhelper.firstpass().url).then(function (res){
        var c = parseCookie(res.getHeader('set-cookie'));

        cookie['H_PS_PSSID'] = c['H_PS_PSSID'];
        cookie['BAIDUID'] = c['BAIDUID'];
        cookie['USERNAMETYPE'] = 1;
        cookie['HOSUPPORT'] = 1;

        requestify.get(baiduhelper.getapi().url,
        {
            cookies : cookie
        }).then(function (res){
            var e = /{[^)]*/;
          //  console.log(e.exec(res.getBody())[0]);
          //  console.log(e.exec(res.getBody())[0].replace(/'/g,'"'));
            var json = JSON.parse(e.exec(res.getBody())[0].replace(/'/g,'"'));
            
            if (json.errInfo.no==0){
                var token = json.data.token;
                requestify.get(baiduhelper.logincheck(token,u).url,
                {
                    cookies : cookie
                }).then(function (res){
                    
                    var json = JSON.parse(e.exec(res.getBody())[0]);
                  //  console.log(res.getBody());
                    if (json.errInfo.no==0 && json.data.codeString==""){
                        final(cookie,token,u,p,next,"","");
                    }
                    else
                    {
                        if (!serverstart) {next(false,"failed in logincheck codeString : ",(json.errInfo.no==0)?(json.data.codeString):"");return;}

                        var et = gentoken(8);
                       // console.log(baiduhelper.genimg(json.data.codeString).url);
                       /* requestify.get(baiduhelper.genimg(json.data.codeString).url,{ cookies : cookie })
                        .then(function(res){*/
                      //  var img = res.getBody();
                        console.log("need input verifycode");
                        verify[et] = function(req,res){
                            var path = url.parse(req.url);
                            var query = querystring.parse(path.query);
                            if (query.aq == 'jpg'){
                                res.writeHead(302, {'Location': baiduhelper.genimg(json.data.codeString).url});
                              //  res.write(img);
                                res.end();
                                return;
                            }else
                            if (query.aq == 'ok'){
                                res.writeHead(200, {'Content-Type': 'text/html'});
                                res.end("received");
                                delete verify[et];
                                final(cookie,token,u,p,next,json.data.codeString,query.code);
                                return ;
                            }else{
                                res.writeHead(404, {'Content-Type': 'text/html'});
                                res.end("cannot find the page");
                            }
                        };
                      /*  }).fail(function(){
                            console.log("cannot get img");
                        });*/
                        
                    }
                });
            }
            else
            {
                next(false,"failed in getapi");
            }
        });
    })
}
exports.start = function(port){
    if (port == null || port == 0){
        port = Math.floor(Math.random()*60000 + 5000);
    }
    serverstart = true;
    http.createServer(function (req,res){
        var path = url.parse(req.url);
        if (verify[path.pathname.split('/')[1]]!=null){
            // 
            verify[path.pathname.split('/')[1]](req,res);
        }
        else{
            res.writeHead(200, {'Content-Type': 'text/html'});
            var htmls = "<!DOCTYPE html><html lang=\"en\"><head><title>List<\/title><script type=\"text/javascript\" src=\"http://code.jquery.com/jquery-2.0.3.min.js\"></script><\/head><body>";
            for (var b in verify)
                htmls += '<div><a href=# data-target="' + b + '"><img src=/' + b + "?aq=jpg /><\/a><\/div>"
            htmls += ' \
            <script> \
                $(function(){ \
                    $("a").click(function(){ \
                        var x = $(this).attr("data-target"); \
                        window.location.href = "/" + x + "?aq=ok&code=" + prompt("ans"); \
                    }); \
                }); \
            <\/script> \
            ';
            htmls += "<\/body><\/html>";
            res.end(htmls);
        }
    }).listen(port, '127.0.0.1');
    console.log('BAIDU Verify help server is running at port ' + port);
};
