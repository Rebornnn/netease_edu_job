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
    xhr.send();
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



//关注登录
function attentionToFollow(){
    var att=document.querySelector(".login-logo"),
        loged=document.querySelector(".loged-logo"),
        error=document.querySelector(".g-login .error"),
        gLogin=document.querySelector(".g-login"),
        close=document.querySelector(".g-login .close"),
        submit=document.querySelector(".g-login .submit");


    //用户登录    
    function logedIn(data){
        if(data==1){
            gLogin.style.display="none";
            get("https://study.163.com/webDev/attention.htm","",follow);
        }else{
            error.style.display="block";
        }  
    } 

    //登录成功后关注
    function follow(data){
        if(data==1){
            att.style.display="none";
            loged.style.display="";
            CookieUtil.set("followSuc");
        }
    }

    EventUtil.addHandler(att,"click",function(){
        //检查登录cookie并显示登录框
        if(document.cookie.indexOf("loginSuc")===-1){
            gLogin.style.display="block";
        }else{
            att.style.display="none";
            loged.style.display="";
        }
    });


    EventUtil.addHandler(submit,"click",function(event){
        event=EventUtil.getEvent(event);
        EventUtil.preventDefault(event);


        var form=document.getElementById("login"),
        query={
            userName:md5(form.elements[0].value),
            password:md5(form.elements[1].value)
        };
   
        get("https://study.163.com/webDev/login.htm",query,logedIn);
    });

    //设置关闭登录框按钮
    EventUtil.addHandler(close,"click",function(){
        gLogin.style.display="none";
    });   
}

//轮播图
function slider(){
    var gSlide=document.querySelector(".g-slide"),
        slides=document.querySelector(".g-slide .m-slide"),
        imgs=document.querySelectorAll(".g-slide img"),
        dots=document.querySelectorAll(".m-dot span"),
        cur=0;

    //切换图片和圆点
    function  next(nexIndex){
        //先清除圆点样式    
        for(var i=0;i<dots.length;i++){
            dots[i].className="";
        }

        //移动圆点
        dots[nexIndex].className="current";
        //移动图片
        slides.style.left=-1616*nexIndex+"px";
        //图片淡入
        imgs[nexIndex].style.opacity=0;
        imgs[nexIndex].style.filter="alpha(opacity:0)";
        var num=0;
        var t=setInterval(function(){
            if(num<10){
                num+=2;
                imgs[nexIndex].style.opacity=num/10;
                imgs[nexIndex].style.filter='alpha(opacity:'+ num*10 +')';
            }else{
                clearInterval(t);
            }
        },100);
    }

    //移动图片和圆点
    function animate(){
        var nex=(cur==2)?0:cur+1;
        next(nex);
        cur=nex;
    }



    //设置清除自动轮播
    EventUtil.addHandler(gSlide,"mouseover",function(){
        if(timer){
            clearInterval(timer);
        }
    });
    EventUtil.addHandler(gSlide,"mouseout",function(){
        timer=setInterval(animate,5000);
    });

    //设置圆点按钮
    for(var i=0;i<dots.length;i++){
        EventUtil.addHandler(dots[i],"click",function(){
            var currentIndex=this.getAttribute("index");
            next(currentIndex-1);
            cur=currentIndex-1;
        });
    }

    //设置定时器
    var timer=setInterval(animate,5000);
}

//创建课程卡片
function createCard(list){
    var card=document.createElement("div"),
        price=0,
        html="";
    card.className="m-card";
    
    if(list.price===0){
        price="免费";
    }else{
        price="￥"+list.price;
    }

    html="<img src=";
    html+=list.middlePhotoUrl;
    html+="><p class='description1'>";
    html+=list.description;
    html+="</p><p class='provider1'>";
    html+=list.provider;
    html+="</p><p class='u-learner-count1'><span class='logo'></span>";
    html+=list.learnerCount;
    html+="</p><p class='price'>";
    html+=price;
    html+="</p><div class='m-show'><img src=";
    html+=list.middlePhotoUrl;
    html+="><p class='name'>";
    html+=list.name;
    html+="</p><p class='u-learner-count2'><span class='logo'></span>";
    html+=list.learnerCount;
    html+="人在学</p><p class='provider2'>发布者：";
    html+=list.provider;
    html+="</p><p class='category-name'>分类：";
    html+=list.categoryName;
    html+="</p><div class='description2'><p>";
    html+=list.description;
    html+="</p></div></div>";
    card.innerHTML=html;
    return card;
}

//获取主栏课程
function getCourse(data){
    var main=document.querySelector(".g-main .m-main");
    for(var i=0;i<data.list.length;i++){
        main.appendChild(createCard(data.list[i]));
    }
}

//课程切换
function changeTab(){
    var tab=document.querySelectorAll(".m-tab li"),
        main=document.querySelector(".g-main .m-main");

    for (var i=0;i<tab.length;i++){
        EventUtil.addHandler(tab[i],"click",function(){
            for(var j=0;j<tab.length;j++){
                tab[j].className="";
            }
            this.className="tab-on";

            while(main.firstChild){
                main.removeChild(main.firstChild);
            }
            query.type=this.getAttribute("type");
            get("https://study.163.com/webDev/couresByCategory.htm",query,getCourse);
        });
    }

}

//翻页器
function pagination(){
    var prev=document.querySelector(".m-pagination .prev"),
        next=document.querySelector(".m-pagination .next"),
        page=document.querySelectorAll(".m-pagination span");
        

    function selected(num){
        var main=document.querySelector(".g-main .m-main");
        while(main.firstChild){
            main.removeChild(main.firstChild);
        }

        for(var i=1;i<page.length-1;i++){
            page[i].className="";
        }
        page[num].className="selected";

        query.pageNo=num;
        get("https://study.163.com/webDev/couresByCategory.htm",query,getCourse);
    }

    for(var j=1;j<page.length-1;j++){
        EventUtil.addHandler(page[j],"click",function(){
            var index=this.firstChild.nodeValue;
            selected(index);
        });
    }

    EventUtil.addHandler(prev,"click",function(){
        var pageOn=document.querySelector(".m-pagination .selected"),
            index=parseInt(pageOn.firstChild.nodeValue)-1;
        if(index===0){
            selected(3);
        }else{
            selected(index);
        }
    });

    EventUtil.addHandler(next,"click",function(){
        var pageOn=document.querySelector(".m-pagination .selected"),
            index=parseInt(pageOn.firstChild.nodeValue)+1;
        if(index===4){
            selected(1);
        }else{
            selected(index);
        }
    });
}

//视频播放
function videoPlay(){
    var videoImg=document.querySelector(".m-info img"),
        play=document.querySelector(".g-play"),
        videoClose=document.querySelector(".g-play .close"),
        video=document.querySelector(".m-play video");

    EventUtil.addHandler(videoImg,"click",function(){
        play.style.display="block";
    });

    EventUtil.addHandler(videoClose,"click",function(){
        video.pause();
        play.style.display="none";
    });
}

//创建热门课程卡片
function createTopCard(list){
    var topCard=document.createElement("div"),
        html="";
    topCard.className="top-card";

    html="<img src=";
    html+=list.middlePhotoUrl;
    html+="><p class='description'>";
    html+=list.description;
    html+="</p><p class='u-learner-count'><span class='logo'></span>";
    html+=list.learnerCount;
    html+="</p>";
    topCard.innerHTML=html;
    return topCard;
}

//创建热门排行
function getTop(data){
    var top=document.querySelector(".m-top .top");
    for(var i=0;i<data.length;i++){
        top.appendChild(createTopCard(data[i]));
    }

    //实现滚动
    var topCards=Array.prototype.slice.call(document.querySelectorAll(".top div"));//类数组转化为数组
    //此处设置数组和DOM对象一起循环滚动！！！
    var t=setInterval(function(){
        var firstItem=topCards.shift();
        top.removeChild(firstItem);
        topCards.push(firstItem);
        top.appendChild(firstItem);
    },5000);
}


window.onload = function() {
    hideNote();
    attentionToFollow();
    //slider();

    query={
        pageNo:1,
        psize:20,
        type:10
    };
    get("https://study.163.com/webDev/couresByCategory.htm",query,getCourse);

    changeTab();
    pagination();
    videoPlay();
    get("https://study.163.com/webDev/hotcouresByCategory.htm","",getTop);

};
