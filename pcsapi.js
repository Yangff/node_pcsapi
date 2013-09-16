var requestify = require('requestify'); 

var pcshelper = {
    download : function (key){
        //http://pan.baidu.com/api/list?channel=chunlei&clienttype=0&web=1&num=100&t=1379255798845&page=1&dir=%2Fgeekcollege&t=0.25950&order=time&desc=1
        //var akey = key.split('.');
        //return {'url':('http://pan.baidu.com/api/search?&dir=&web=1&key=' + encodeURIComponent(akey[2] + "." + akey[3] + ".gkv.mp4") + '&recursion&timeStamp=' + Math.random())};
        var akey = key.split('.');
        var vp = '/geekcollege/' + akey[2] + "/" + akey[1] + '/' + akey[0] + '/';
        return {'url':
            "http://pan.baidu.com/api/list?channel=chunlei&clienttype=0&web=1&num=100&t=" + Date.now() + "&page=1&dir=" + encodeURIComponent(vp) + "&t=" + Math.random() + "&order=time&desc=1&_=" + Date.now()
        }
    },
    upload : function (key){
        var akey = key.split('.');
        //console.log(key.replace(/\./g,'/'));
        var vp = '/geekcollege/' + akey[2] + "/" + akey[1] + '/' + akey[0] + '/';
        var path = encodeURIComponent(vp + akey[3] + ".gkv.mp4");
        var cfg = {
            "content-length":akey[0],
            "content-md5":akey[2],
            "slice-md5":akey[1],
            "contentcrc32":akey[3]
        };
        //https://pcs.baidu.com/rest/2.0/pcs/file?method=rapidupload&app_id=250528&path=%2F%E6%B5%8B%E8%AF%95%E5%BA%94%E7%94%A8%2F91ad999814895e979c79be9bca9882f9.gkv&content-length=148645974&content-md5=91ad999814895e979c79be9bca9882f9&slice-md5=b60cc48eef06505537936fd3a66b0344&contentcrc32=1373590915
        return {url:('https://pcs.baidu.com/rest/2.0/pcs/file?method=rapidupload&app_id=250528&path=' + path),'post':cfg};
    }
};
exports.PCS = {
    download : function(cookie,key,next){
        var op = pcshelper.download(key);
    //console.log(op);
        requestify.request(op.url,{
            method:'GET',
            cookies:cookie,
            timeout : 5000
        }).then(function (res){
            if (res.body) next(res.body);
        }).fail(function (err){
            if (err.body) next(err.body);
        });;
    },
    upload : function(cookie,key,next){
        var op = pcshelper.upload(key);
        // console.log(op);
        requestify.request(op.url,{
            method:'POST',
            cookies:cookie,
            body:op.post,
            timeout : 5000,
            dataType: 'form-url-encoded'
        }).then(function (res){
            if (res.body) next(res.body);
        }).fail(function (err){
            if (err.body) next(err.body);
        });
    },
    _delete : function(cookie,key,next){
        next(true);
    }
}
