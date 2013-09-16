pcsvideo
============
**pcsvideo** 是一个使用nodejs对百度网盘资源进行访问的小程序。

他直接解析百度网盘的API，而不是PCS的api，这样取回的文件地址不会包含access key，那么用途你懂的。

因为我不是很熟悉node.js的package制作，另一方面，`jugglingdb` 各种奇葩的bug，导致我对他的代码进行了一部分修改，所以……还是你懂的。。

server.js 
---------------
server.js 是主程序支持

>/get/key

请求指定md5的视频

以下两个api仅支持服务端访问

为了使用他们，请建立SSL目录，并在里面放置证书。
CA.crt
server.key
server.crt

>/add/key
仅允许服务端访问
根据文件特征秒传文件
这里的文件特征请通过`tookit/rapidid`计算
>/delete
仅仅在数据库中删除文件。
因为在pcs上删除文件要用到特殊的token，而这个token随着www发下，而且过期比较快，而维持token会消耗比较大的带宽资源，建议导出所有应该删除的文件后在本地删除。

admin.js 
--------------
admin.js是管理百度帐号的工具。

具体命令`node admin -h`后，按照提示使用即可。

guard.js
----------------
guard.js 是维持百度cookie所使用的工具。直接启动即可。
（暂未完成）

config.json
----------------
config.json 是配置文件，格式是这样的：

```json
{
    'deal' : 0,  // 刷新cookie的时间间隔，秒为单位，时间运行时会+-60 // 暂不支持
    // sql access data
    'sqltype' : '', // only allow postgresql now
    'host' : '',
    'username' : '',
    'password' : '',
    'port'     : '',
    'database' : '',
    'prefix'   : '',
    // service
    'ssl'      : false // 是否使用ssl（指针对get，而add和delete强制https+client auth）
}
```