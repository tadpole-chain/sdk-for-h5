# sdk-for-h5

[English](./README_EN.md "English Document")

SDK文件以异步方式加载，H5游戏只需要在项目中包含require.js，并按如下方式调用即可：


    var sdk_full = tct_require('http://api_static.tadpolechain.com/js-sdk/sdk.js');
    var _key='73c4cc9c-840a-11e8-8ef8-06043b9d0ad6';//申请的Key
    var _secret='a4f14e1175e108d801ac1e0fd122ebde';//申请的secret
    sdk_full.ready(function(){ 
        console.log('sdk ready');
        tct_init_sdk(_key, _secret);
        tct_start_sdk();
    });

根据游戏业务逻辑H5游戏可调用的方法有以下几个：


    暂停计时：tct_offline()

    继续计时：tct_online()
    
    获取广告并显示：tct_getAdData()

    上传游戏分数：tct_postScore(score)
