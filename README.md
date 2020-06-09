
> xfunction-activity包括两部分
> * 在线活动，类似活动行等第三方应用，活动发布，活动报名，活动签到，签到大屏，活动抽奖等等
> * 问卷调查/信息收集，类似第三方麦克表单应用，提供自定义表单，及相关后台功能。

## 技术要点
* Angular 8.2+
* Angular Material 模板
*  主要目录结构：
  * src/app
    * activity 活动相关
    * define 自定义组件
    * pipe 自义类管道
    * tools 问卷调查/信息收集相关
    * ts 自定义对象类
    * user 用户相关组件
* 主要依赖说明
    * "@fortawesome/angular-fontawesome"
    * "@fortawesome/fontawesome-svg-core"
    * "@fortawesome/free-regular-svg-icons"
    * "@fortawesome/free-solid-svg-icons"，以上4引入awesome图标
    * "@iplab/ngx-color-picker": 着色选择组件，主要用于自定义界面中的着色
    * "@tweenjs/tween.js"
    * "stats.js"
    * "three"
    * "three-full"：以three.js为主相关引入，主要用于签到大屏相关功能。
    * "angularx-qrcode": 二维码生成组件
    * "html2canvas":dom转成图片组件，主要用于生成海报等
    * "ngx-image-cropper": 上传图片裁剪组件
    * "quill": 
    * "quill-image-resize": 
    * "quill-image-resize-module": quill文本编辑器相关
    * "weixin-jsapi": 微信相关，主要用于微信扫码签到。

  ## [API应用服务在( xfunction-api )中的位置](https://github.com/KelvinDong/xfunction-api)

* modules/activity/* 
* modules/user/*

 
![](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200609102706.png)
![](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200609102757.png)
![](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200609102852.png)
![](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200609102908.png)
![](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200609102929.png)
![](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200609102943.png)
![](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200609102959.png)
![](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200609103015.png)
![](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200609103103.png)
![](https://acebridge2019.oss-cn-shanghai.aliyuncs.com/201910/x/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200609103119.png)