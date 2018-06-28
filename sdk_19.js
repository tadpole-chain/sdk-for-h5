var _tct_debug = true;
var _tct_api_root = "http://api.tadpolechain.com/v1/sdk/";
var _tct_device_id = null;
var _tct_session_id = null;
var _tct_qiniu_res_root = "http://img.suncity.ink/";

var link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = "http://img.suncity.ink/js_sdk_styles.css";
document.getElementsByTagName("head")[0].appendChild(link);
var msgs = [];
var index = 0;
var _duration_ajax_interval = null;
var _ad_divider = 5 * 60 * 1000;
var _online_time = Date.now();

function clearDurationInterval() {
  if (_duration_ajax_interval) {
    clearInterval(_duration_ajax_interval);
    _duration_ajax_interval = null;
  }
}
document.addEventListener("visibilitychange", function() {
  console.log("visibilitychange call");
  if (_tct_session_id && _tct_device_id) {
    if (document.hidden) {
      if (_tct_debug) {
        console.log("visibilitychange hidden");
      }
      tct_offline();
      clearDurationInterval();
    } else {
      if (_tct_debug) {
        console.log("visibilitychange show");
      }
      tct_online();
      // _duration_ajax_interval = setInterval(_duration_ajax, 5000);
    }
  }
});
EventUtil = {
  addHandler: function(ele, type, handle) {
    if (ele.addEventListener) {
      return ele.addEventListener(type, handle, false);
    } else if (ele.attachEvent) {
      return ele.attachEvent("on" + type, handle);
    } else {
      return (ele["on" + type] = handle);
    }
  }
};
EventUtil.addHandler(window, "beforeunload", function(e) {
  e = e || window.event;
  var mes = "要离开游戏吗？";
  // e.returnValue = mes;
  tct_offline();
  // return mes;
});
/**
 * 获取指定的URL参数值
 * 参数：paramName URL参数
 * 调用方法:getParam("name")
 * 返回值:tyler
 */
function getParam(paramName) {
  (paramValue = ""), (isFound = !1);
  if (
    this.location.search.indexOf("?") == 0 &&
    this.location.search.indexOf("=") > 1
  ) {
    (arrSource = unescape(this.location.search)
      .substring(1, this.location.search.length)
      .split("&")),
      (i = 0);
    while (i < arrSource.length && !isFound)
      arrSource[i].indexOf("=") > 0 &&
        arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() &&
        ((paramValue = arrSource[i].split("=")[1]), (isFound = !0)),
        i++;
  }
  return paramValue == "" && (paramValue = null), paramValue;
}
/**
 * 启动SDK
 */
function tct_start_sdk() {
  console.log("--------------tct_start_sdk--------------");
  var t = getParam("session_id");
  var d = getParam("device_id");
  var s = getParam("status");

  if (t && d) {
    _tct_session_id = t;
    _tct_device_id = d;
    initNoticeDom();
    var st = 200;
    if (s) {
      try {
        st = parseInt(s);
      } catch (error) {}
    }

    if (st < 200) {
      setTimeout(
        'addMessage("您的账户还未激活，游戏过程中不会产生价值奖励。");',
        3000
      );
    } else {
      tct_online();
      setTimeout(
        'addMessage("价值奖励已开始计算，奖励数量每五分钟公告一次，也可返回APP查询。");',
        3000
      );
    }

    // setTimeout('addMessage("http://img.suncity.ink/sdk-img-ad.pn");',4000);
    // setTimeout('createWelcome("Kevin");',1000);

    // setTimeout("createVerticalBanner('http://img.suncity.ink/sdk-img-ad.png','http://www.baidu.com/')",5000);
  }
}
/**
 * 到服务器的主动退出登录请求。
 */
function tct_offline() {
  console.log("--------------tct_offline--------------");
  clearDurationInterval();
  _ajax("PUT", _tct_api_root + "game/offline", function(res) {
    if (_tct_debug) {
      console.log("_offline_ajax got response");
    }
  });
}

/**
 * 到服务器的主动上线请求。
 */
function tct_online() {
  console.log("--------------tct_online--------------");
  _ajax(
    "PUT",
    _tct_api_root + "game/online?device_id=" + _tct_device_id,
    function(res) {
      if (_tct_debug) {
        console.log("tct_online got response");
      }
      if (res.code == 200) {
        if (res.data.status != 0) {
          _duration_ajax_interval = setInterval(_duration_ajax, 5000);
        }

        createWelcome(res.data.nickname);
        localStorage.removeItem("_tct_ad_times");
        localStorage.removeItem("_tct_profit");
        if (res.data.profit) {
          localStorage.setItem("_tct_profit", res.data.profit);
        }
        if (res.data.ad_divider) {
          _ad_divider = res.data.ad_divider * 60 * 1000;
        }
        if (msgs.length > 0) {
          msgs = [];
        }
        _online_time = Date.now();
      }
    }
  );
}
/**
 * 到服务器获取广告请求。
 */
function tct_getAdData(direct) {
  console.log("--------------tct_getAdData--------------");
  if (!direct) {
    var horizontalBanner = document.getElementsByClassName("horizontalBanner");
    var verticalBanner = document.getElementsByClassName("verticalBanner");
    if (horizontalBanner.length > 0 || verticalBanner.length > 0) {
      console.log("当前广告未关闭，不需要再获取");
      return;
    }
    if (Date.now() - _online_time < _ad_divider) {
      console.log("不到广告间隔显示时间，不需要再获取");
      return;
    }
  }
  _ajax("GET", _tct_api_root + "game/ad", function(res) {
    if (_tct_debug) {
      console.log("_offline_ajax got response");
    }

    if (res.code == 200) {
      _online_time = Date.now();
      if (res.data.type == 0) {
        createHorizontalBanner(res.data.image, res.data.content);
      } else {
        createVerticalBanner(res.data.image, res.data.content);
      }
    }
  });
}

/**
 * 到服务器获取广告请求。
 */
function tct_postScore(score) {
  console.log("--------------tct_postScore--------------" + score);

  _ajax(
    "POST",
    _tct_api_root + "game/score",
    function(res) {
      if (_tct_debug) {
        console.log("tct_postScore got response");
      }
    },
    { score: score }
  );
}
/**
 * 到服务器的心跳请求。
 */
function _duration_ajax() {
  _ajax("PUT", _tct_api_root + "game/duration", function(res) {
    if (_tct_debug) {
      console.log("_duration_ajax got response");
    }

    if (res.code == 200) {
      var _ad_times = localStorage.getItem("_tct_ad_times");
      if (_ad_times && typeof _ad_times == "string") {
        try {
          _ad_times = parseInt(_ad_times);
        } catch (error) {
          _ad_times = res.data.ad_times;
        }
      } else {
        _ad_times = res.data.ad_times;
      }

      if (res.data.ad_times > _ad_times) {
        localStorage.setItem("_tct_ad_times", res.data.ad_times);
        tct_getAdData(false);
      }

      if (res.data.profit) {
        var _tct_profit = localStorage.getItem("_tct_profit");
        if (_tct_profit != "undefined" && _tct_profit) {
          if (typeof _tct_profit == "string") {
            try {
              _tct_profit = parseFloat(_tct_profit);
            } catch (error) {
              _tct_profit = res.data.profit;
            }
          }
          if (_tct_profit < res.data.profit) {
            addMessage(
              "恭喜，您获得了 <span style='color:#58C0F1'>" +
                (res.data.profit - _tct_profit).toFixed(6) +
                " TCT</span>"
            );
            localStorage.setItem("_tct_profit", res.data.profit);
          }
        }
      }
    }
  });
}
/**
 * 发起ajax请求
 * @param {HTTP Method} method
 * @param {Request URL} url
 * @param {Callback function} cb
 */
function _ajax(method, url, cb, data) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // 4 = "loaded"
      if (xhr.status == 200) {
        // 200 = "OK"
        var response = xhr.responseText; //对返回结果进行处理

        if (_tct_debug) {
          console.log("res-time:" + new Date().toLocaleString());
          console.log("response:" + response);
        }
        if (cb) {
          cb(JSON.parse(response));
        }
      }
    }
  };
  xhr.setRequestHeader("Content-Type", "application/json");
  if (_tct_session_id) {
    xhr.setRequestHeader("Authorization", "Bearer " + _tct_session_id);
  }
  if (!data) {
    data = {};
  }
  data.device_id = _tct_device_id;
  if (_tct_debug) {
    console.log("req-time:" + new Date().toLocaleString());
  }
  xhr.send(JSON.stringify(data));
}

function addMessage(msg) {
  _tct_notice_p = document.getElementById("_tct_notice_p");
  _tct_notice_info = document.getElementById("Info");

  if (msgs.length == 0) {
    msgs.push(msg);
    if (_tct_notice_info.style.display == "none") {
      _tct_notice_p.innerHTML = msgs.shift();
      _tct_notice_info.style.display = "block";
      _tct_notice_timer = setInterval(startMarquee, 30);
    }
  } else {
    msgs.push(msg);
  }
}
// scroll();
var _tct_notice_timer = null;
var swiper = null;
var _tct_notice_p = null;
var _tct_notice_info = null;
function initNoticeDom() {
  var info = document.createElement("div");
  var div = document.createElement("div");
  var p = document.createElement("p");
  // console.log(msgs)
  p.innerHTML = msgs[0];
  p.style.position = "absolute";
  p.style.left = "100%";
  info.className = "info";
  div.className = "inner";
  div.appendChild(p);
  info.appendChild(div);
  p.id = "_tct_notice_p";
  info.id = "Info";
  // info.style.left = "90%";
  info.style.display = "none";
  document.body.appendChild(info);
  var p_w = p.offsetWidth;
  var div_w = info.offsetWidth;
  if (div_w > p_w) {
    return false;
  }
  div.innerHTML = div.innerHTML;
}
function startMarquee() {
  if (
    _tct_notice_p.offsetWidth + window.outerWidth <=
    _tct_notice_info.scrollLeft
  ) {
    // info.scrollLeft -= p_w;
    _tct_notice_info.scrollLeft = 0;

    if (msgs.length == 0) {
      _tct_notice_info.style.display = "none";
      // document.body.removeChild(info);
      clearInterval(_tct_notice_timer);
      _tct_notice_timer = null;
    } else {
      var _msg = msgs.shift();
      _tct_notice_p.innerHTML = _msg;
      //   _tct_notice_info.scrollLeft = -_tct_notice_p.offsetWidth;
    }
  } else {
    _tct_notice_info.scrollLeft++;
  }
}

function createWelcome(playerName) {
  if (_tct_notice_timer) {
    console.log("show notice.cancel welcome info.");
    return;
  }
  var Welcome = document.createElement("div");
  var WelcomeChildBox = document.createElement("div");
  var WelcomeImg = document.createElement("img");
  var WelcomeTitle = document.createElement("div");
  var WelcomeDesc = document.createElement("div");
  Welcome.className = "welcome";
  WelcomeChildBox.className = "welcomeChildBox";
  WelcomeTitle.className = "welcomeTitle";
  WelcomeDesc.className = "welcomeDesc";
  WelcomeImg.src = _tct_qiniu_res_root + "jssdk_welcomelogo.png";

  WelcomeTitle.innerHTML = "欢迎回来，";
  WelcomeDesc.innerHTML = playerName;
  WelcomeChildBox.appendChild(WelcomeImg);
  WelcomeChildBox.appendChild(WelcomeTitle);
  WelcomeChildBox.appendChild(WelcomeDesc);
  Welcome.appendChild(WelcomeChildBox);
  document.body.appendChild(Welcome);
  setTimeout(function() {
    document.body.removeChild(Welcome);
    // setTimeout("tct_getAdData(true)",5000);
  }, 2000);
}
function createVerticalBanner(adImg, adUrl) {
  var VerticalBanner = document.createElement("div");
  var VerticalBannerChildBox = document.createElement("div");
  var VerticalBannerImg = document.createElement("img");
  var VerticalBannerClose = document.createElement("img");
  VerticalBanner.className = "verticalBanner";
  VerticalBannerChildBox.className = "verticalBannerChildBox";
  VerticalBannerClose.className = "verticalBannerClose";
  VerticalBannerImg.className = "verticalBannerImg";
  VerticalBannerImg.src = adImg;
  VerticalBannerClose.src = _tct_qiniu_res_root + "js_sdk_close.png";

  VerticalBannerChildBox.appendChild(VerticalBannerImg);
  VerticalBannerChildBox.appendChild(VerticalBannerClose);
  VerticalBanner.appendChild(VerticalBannerChildBox);
  document.body.appendChild(VerticalBanner);
  VerticalBannerClose.onclick = function() {
    VerticalBanner.style.display = "none";
    document.body.removeChild(VerticalBanner);
    // setTimeout("createHorizontalBanner('http://img.suncity.ink/sdk-img-ad.png','http://www.baidu.com/')",2000);
  };

  if (adUrl) {
    VerticalBannerImg.onclick = function() {
      openUrl(adUrl);
    };
  }
}
function createHorizontalBanner(adImg, adUrl) {
  var HorizontalBanner = document.createElement("div");
  var HorizontalBannerChildBox = document.createElement("div");
  var HorizontalBannerImgBox = document.createElement("div");
  var HorizontalBannerImg = document.createElement("img");
  var HorizontalBannerClose = document.createElement("img");
  HorizontalBanner.className = "horizontalBanner";
  HorizontalBannerChildBox.className = "horizontalBannerChildBox";
  HorizontalBannerClose.className = "horizontalBannerClose";
  HorizontalBannerImg.className = "horizontalBannerImg";
  HorizontalBannerImgBox.className = "horizontalBannerImgBox";
  HorizontalBannerImg.src = adImg;
  HorizontalBannerClose.src = _tct_qiniu_res_root + "js_sdk_close.png";
  HorizontalBannerImgBox.appendChild(HorizontalBannerImg);
  HorizontalBannerChildBox.appendChild(HorizontalBannerImgBox);
  HorizontalBannerChildBox.appendChild(HorizontalBannerClose);
  HorizontalBanner.appendChild(HorizontalBannerChildBox);
  document.body.appendChild(HorizontalBanner);

  HorizontalBannerClose.onclick = function() {
    HorizontalBanner.style.display = "none";
    document.body.removeChild(HorizontalBanner);
  };
  if (adUrl) {
    HorizontalBannerImg.onclick = function() {
      openUrl(adUrl);
    };
  }
}

function openUrl(_url) {
  var _a_tag = document.createElement("div");
  // _a_tag.href = "#";
  //   _a_tag.target="_blank"
  _a_tag.id = "__a_openwin";

  document.body.appendChild(_a_tag);
  _a_tag = document.getElementById("__a_openwin");
  _a_tag.addEventListener("click", function(e) {
    window.open(_url, "_blank", "location=no");
  });
  _a_tag.click(); //点击事件
  document.body.removeChild(_a_tag);
  // $('body').append($('<a href="'+url+'" target="_blank" id="openWin"></a>'))
  // document.getElementById("__a_openwin").click();//点击事件
  // $('#openWin').remove();
}
JS["sdk.js"].export = "sdk.js";
JS["sdk.js"].ready();
