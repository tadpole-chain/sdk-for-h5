
// 

var sdk_full=tct_require('sdk.js');


// var sdk_full = tct_require('http://api_static.tadpolechain.com/js-sdk/sdk.js');

sdk_full.ready(function(){
    //SDK准备好时要执行的函数
    console.log('sdk ready');
    tct_start_sdk();
});
