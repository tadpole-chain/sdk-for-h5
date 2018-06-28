# sdk-for-h5

SDK文件以异步方式加载，H5游戏只需要在项目中包含require.js，并按如下方式调用即可：


    var sdk_full = tct_require('http://api_static.tadpolechain.com/js-sdk/sdk.js');

    sdk_full.ready(function(){ 
        console.log('sdk ready');
        tct_start_sdk();
    });

根据游戏业务逻辑H5游戏可调用的方法有以下几个：


    暂停计时：tct_offline()

    继续计时：tct_online()
    
    获取广告并显示：tct_getAdData()
