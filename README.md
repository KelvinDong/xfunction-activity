
> 短链接/短网址/短地址,实现将形如：htts://www.xfunction/shortLink/index.html的网址收缩成https://xfu.biz/zdfXs形态的网址。

## 技术要点
* 基本jquery,gulp打包。
* 目录结构：
  * html
    * include  gulp打包时使用到的包含文件
    * html
      * index.html www.xfunction.cn的准静态页面。
      * **shortLink**
        * **index.html 短链接生成操作页面。**
        * **redirect.html  访问短链接的跳转页面。**
    * statics
      * css
      * font
      * images
      * js
        * min
          * clipboard.min.js 第三方拷贝
          * jqColorPicker.min.js 第三方着色选择
          * mdb.js https://mdbootstrap.com/templates/ 模板
        * cropper.js
        * jquery-cropper.js 第三方截图
        * qrcode.js 第三方二维码生成
        * xfunction.qrcode.js  再封闭的二维码生成
        * global.js  配置等常用工具
* web服务器配置
  * 主域名www.xfunction.cn常规配置，不作特别说明。
  * 短链接域名 xfu.biz的nginx配置如下
  ```
  server {
        listen       443 ssl;
        server_name  xfu.biz;
        #ssl on;
        ssl_certificate   cert/xfu.biz.pem;
        ssl_certificate_key  cert/xfu.biz.key;
        ssl_session_timeout 5m;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_prefer_server_ciphers on;

        #charset koi8-r;

        access_log  logs/xfu.access.log  main;
        ## redirect 确保日志记录完整，否则 301 客户端记住了，就不来了

        location / {
            root   /project/run/www;
            index  index.html index.htm;
            rewrite ^/(.+)$ https://www.xfunction.cn/html/shortLink/redirect.html?linkId=$1 redirect;
        }
  }

  ```
 

  ## [API应用服务在( xfunction-api )中的位置](https://github.com/KelvinDong/xfunction-api)

* modules/shortlink/* 短链接相关

 
 ![生成页面](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200608150651.png)
![生成结果](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200608150830.png)
![首页](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200608150558.png)