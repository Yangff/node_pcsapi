百度登录API解析
===================
对百度（www.baidu.com）发起一次访问，得到：cookie BAIDUID 在 *.baidu.com域下

带着cookie BAIDUID对
> https://passport.baidu.com/v2/api/?getapi&tpl=mn&apiver=v3&class=login&tt=时间&logintype=dialogLogin&callback=随便什么都可以
进行访问，得到$TOKEN$

带着cookie BAIDUID $TOKEN$对
> https://passport.baidu.com/v2/api/?logincheck&token=$TOKEN$&tpl=mn&apiver=v3&tt=时间&username=用户名&isphone=false&callback=随便什么都可以
进行访问

注意，这一步返回的是{"errInfo":{ "no": "0" }, "data": { "codeString" : "" }}

请注意，如果有验证码……恭喜悲剧再见。

最后带着cookie BAIDUID $TOKEN$ 对：

> https://passport.baidu.com/v2/api/?login
进行访问，

挟带以下信息：

```
staticpage:http://www.baidu.com/cache/user/html/v3Jump.html // 这个反正传递这个肯定没问题，这个其实是baidu登录后跳转的，反正不管他啦，也用不倒了
charset:UTF-8 // 编码字符集
token:$TOKEN$
tpl:mn
apiver:v3
tt:当前时间
codestring:留空
isPhone:false
safeflg:0
u:http://www.baidu.com/
quick_user:0
usernamelogin:1
splogin:rate
username:用户名
password:密码明文
verifycode:留空
mem_pass:on
ppui_logintime:5000 是一些登录用时间的，给个7000~10000的随机数就好了
callback:parent.bd__pcbs__oa36qm
```
然后会得到一些cookie，*.baidu.com下的记下来，就可以对网盘资源进行操作了！
''