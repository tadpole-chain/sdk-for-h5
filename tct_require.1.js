var JS={};//(3)中要创建的JS['str.js']对象，首先得有一个叫JS的对象。
function tct_require(path){
    //比如我们require('js/str.js') , 我们需要获取'str.js'这个文件名
    var filename = path.split('/');
    filename = filename[filename.length-1];
    JS[filename]={
        fn:[/*这个就是(4)中提到的那个队列*/],
        //这是(2)中提到的方法，str.js文件里面执行这个方法就代表它加载完了
        ready:function(){
            JS[filename].fn.forEach(function(fn){
                //JS['str.js'].export就是str.js要提供的东西：'我是str'
                fn(JS[filename].export);
            });
            //这是(5)中提到的，ready函数的重写
            JS[filename].rt.ready = function(fn){
                fn(JS[filename].export);
            };
        },
        rt:{
            ready:function(fn){
                JS[filename].fn.push(fn);
            }//这个就是str对象的ready函数
        }

    };
    //这是(1)中提到的插入script标签
    var script = document.createElement('script');
    script.src = path;
    document.head.appendChild(script);
    //这是(3)中要返回的对象
    return JS[filename].rt;
}