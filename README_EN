# sdk-for-h5

The SDK file is loaded asynchronously. H5 games only need to include require.js in the project and call it as follows:


    var sdk_full = tct_require('http://api_static.tadpolechain.com/js-sdk/sdk.js');

    sdk_full.ready(function(){ 
        console.log('sdk ready');
        tct_start_sdk();
    });

According to the game business logic H5 game can call the following methods:


    Pause timing:tct_offline()

    Continue to time:tct_online()
    
    Get ads and show:tct_getAdData()

    Upload game score:tct_postScore(score)
