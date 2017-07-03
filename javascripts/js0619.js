//Ajax跨域get方法封装，跨浏览器兼容
function get(url, query, callback) {
    //将传入的查询字符串对象转成数组，再添加到url后面
    var pairs = [];
    for (var name in query) {
        if (!query.hasOwnProperty(name)) continue;
        if (typeof query[name] == 'function') continue;
        var value = query[name].toString();
        name = encodeURIComponent(name);
        value = encodeURIComponent(value);
        pairs.push(name + '=' + value);
    }
    var newQuery = pairs.join('&');
    var newUrl = url + "?" + newQuery;

    //跨域能力检查
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open("get", newUrl, true);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open("get", newUrl);
    } else {
        xhr = null;
        console.log("xhr不存在");
    }

    //收到响应并处理
    xhr.onload = function() {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            console.log('成功获取数据');
            var data = JSON.parse(xhr.responseText);
            if (typeof callback == 'function') {
                callback(data, query);
            } else {
                console.log('Request was unsuccessful:' + xhr.status);
                return '';
            }
        }
    };
    xhr.send(null);
}

//事件封装
var EventUtil = {

    //添加事件
    addHandler: function(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    },

    //取得事件对象
    getEvent: function(event) {
        return event ? event : window.event;
    },

    //取得事件目标
    getTarget: function(event) {
        return event.target || event.srcElement;
    },

    //取消事件的默认行为
    preventDefault: function(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },

    //删除事件
    removeHandler: function(element, type, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(type, handler, false);
        } else if (element.detachEvent) {
            element.detachEvent("on" + type, handler);
        } else {
            element["on" + type] = null;
        }
    },

    //阻止事件冒泡
    stopPropagation: function(event) {
        if (event.stopPropagation) {
            event.stopPropafation();
        } else {
            event.cancleBubble = true;
        }
    }
};


//cookie封装
var CookieUtil = {
    //读取
    get: function(name) {
        var cookieName = encodeURIComponent(name) + "=",
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = null;

        if (cookieStart > -1) {
            var cookieEnd = document.cookie.indexOf(";", cookieStart);
            if (cookieEnd == -1) {
                cookieEnd = document.cookie.length;
            }
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
        }

        return cookieValue;
    },

    //设置
    set: function(name, value, expires, path, domain, secure) {
        var cookieText = encodeURIComponent(name) + "=" +
            encodeURIComponent(value);

        if (expires instanceof Date) {
            cookieText += "; expires=" + expires.toGMTString();
        }

        if (path) {
            cookieText += "; path=" + path;
        }

        if (domain) {
            cookieText += "; domain=" + domain;
        }

        if (secure) {
            cookieText += "; secure";
        }

        document.cookie = cookieText;
    },

    //变相删除
    unset: function(name, path, domain, secure) {
        this.set(name, "", new Date(0), path, domain, secure);
    }
};


//顶部通知条
function hideNote() {
    var note = document.querySelector(".g-note"),
        close = document.querySelector(".g-note .close"),
        name = "closenote";
    if (CookieUtil.get(name)) {
        console.log(CookieUtil.get(name));
        note.style.display = "none";
    }
    EventUtil.addHandler(close, "click", function() {
        CookieUtil.set("closenote", "ok", new Date("April 1, 2018"));
        note.style.display = "none";
    });
}

//导航关注
function attention(){
    var att=document.querySelector(".login-logo"),
        gLogin=document.querySelector(".g-login"),
        close=document.querySelector(".g-login .close");

    //检查登录cookie并显示登录框
    EventUtil.addHandler(att,"click",function(){
        if(document.cookie.indexOf("loginSuc")===-1){
            gLogin.style.display="block";
        }
    });
    //设置关闭登录框按钮
    EventUtil.addHandler(close,"click",function(){
        gLogin.style.display="none";
    });
}

//用户登录
function logIn(){
    var form=document.getElementById("login"),
        query={
            userName:md5(form.elements[0]),
            password:md5(form.elements[1])
        };
    
    function follow(data){
        
    }    
    get("https://study.163.com/webDev/login.htm",query,follow);    
}

window.onload = function() {
    hideNote();
    attention();
};
