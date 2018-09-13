# sdk-for-h5
[中文文档](./README.md "中文文档")

The SDK file is loaded asynchronously. H5 games only need to include require.js in the project and call it as follows:


    var sdk_full = tct_require('http://api_static.tadpolechain.com/js-sdk/sdk.js');
    var _key='73c4cc9c-840a-11e8-8ef8-06043b9d0ad6';//Key
    var _secret='a4f14e1175e108d801ac1e0fd122ebde';//secret
    sdk_full.ready(function(){ 
        console.log('sdk ready');
        tct_init_sdk(_key, _secret);
        tct_start_sdk();
    });

According to the game business logic H5 game can call the following methods:


    Pause timing:tct_offline()

    Continue to time:tct_online()
    
    Get ads and show:tct_getAdData()

    Upload game score:tct_postScore(score)
