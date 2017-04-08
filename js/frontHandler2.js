/**
 * Created by Y-Star on 2017/3/18.
 */
var FrontHandlerClass = (function(){
  function FrontHandler(args) {
    //私有变量
    var $type = '';
    var $page = 0;
    var $showData = [];
    var $list = document.getElementById('listWrapper').querySelector('ul');
    var liCopy = $list.querySelector('li').cloneNode(true);
    var $fragCache = document.createDocumentFragment();
    function request(message,callback) {
      console.log('front request');
      chrome.runtime.sendMessage(message,function (response) {
        callback(response);
      });
    }
    function listen(){
      chrome.runtime.onMessage.addListener(function (msg,sender,sendMessage) {
        if(msg.type=='changeTime'||msg.type=='changeSong'){
          refleshUI(msg);
        }
        return true;
      });
    }
    //私有方法，刷新UI界面
    var refleshUI = (function() {
      //缓存dom对象
      var bground = document.getElementById('background-blur');
      var pic = document.getElementById('pic');
      var titles = document.getElementById('title').querySelectorAll('span');
      var controlArea = document.getElementById('controlArea');
      var progressBar = controlArea.querySelector('.progressBar>div');
      var playBt = controlArea.querySelector('.playBt');
      var volumeBar = controlArea.querySelector('.volumeBar>div');
      //返回实际刷新UI界面方法
      return function (response) {
        if (response.type == 'createUI' || response.type == 'changeSong') {
          var picUrl = '';
          if(response.song.songPic[0] == '.'){
            picUrl = 'url('+response.song.songPic+')';
          }
          else
            picUrl = 'url(https://y.gtimg.cn/music/photo_new/T002R300x300M000' + response.song.songPic + '.jpg?max_age=2592000)';
          bground.style.backgroundImage = picUrl;
          pic.style.backgroundImage = picUrl;
          pic.style.animation = 'rotation ' + response.song.time / 2 + 's linear 0s infinite normal';
          titles[0].innerText = response.song.song;
          titles[1].innerText = response.song.singer;
          progressBar.style.width = response.progress * 100 + '%';
          volumeBar.style.width = response.volume * 100 + '%';
          if (!response.paused) {
            playBt.classList.remove('toPlay');
            playBt.classList.add('toPause');
          } else {
            playBt.classList.remove('toPause');
            playBt.classList.add('toPlay');
          }
        } else if (response.type == 'changeTime') {
          if(progressBar.dataset.modifiable == 'true'){
            progressBar.style.width = response.progress * 100 + '%';
            var curTime = Math.round(response.currentTime);
            progressBar.querySelector('span').title = Math.floor(curTime/60) + ':' + curTime % 60 + ' / ';
          }
        }
      }
    })();
    //公有变量和方法
    return {
      publicRequest:request,
      publicListen:listen,

      get showType(){
        return $type;
      },
      set showType(newType){
        if(newType != $type){
          console.log('topList Click');
          //隐藏列表，以进行修改
          $list.style.display = 'none';
          $type = newType;
          $showData = [];
          $page = 1;
          this.loadSongs($page);
        }else{
          //document.getElementById('list').scrollTop = 0;//返回顶部
        }
      },
      get showData(){
        return $showData;
      },
      //请求加载展示第page页的数据//收藏、播放不同,不用再request()
      loadSongs:function (page) {
        console.log('topList Click' + page);
        switch($type)
        {
          case 'topList':{
            if($showData.length <= (page-1)*8){       //缓存的数据量不够，向后台请求更多数据
              request({handler:'topList',page:page},this.showResult.bind(this,(page-1)*8,(page*8-1)));
            }else{
              this.showResult((page-1)*8,(page*8-1),[]);
            }
          };break;

          case 'search':{           //搜索比较特殊，每次搜索都是获取第一页，后台是直接当作新搜索词来获取数据，把原来的数据全部丢弃，搜索结果没有缓存
            request({handler:'search',key:'',page:page},this.showResult.bind(this,(page-1)*8,(page*8-1)));
          };break;

          default:{             //当$type为playList、collect时，即是显示播放列表和收藏列表；
            if(page===1)        //在切换为playList和collect时，即第一次从后台获取数据，就能获取所有数据，以后不用再向后台请求
              request({handler:$type,do:'load'},this.showResult.bind(this,0,7));
            else
              this.showResult((page-1)*8,(page*8-1),[]);
          };break;
        }
      },
      //数据渲染函数
      showResult:function (begin,end,newData) {
        console.log('topList Click');
        //加入新数据
        newData.forEach(function(el){
          $showData.push(el);
        });
        var length = $showData.length;
        //length>begin时,已经有新的数据插入，或者缓冲的数据充足，能展示出来
        if(length > begin){
          end = ((length-1)<end)?(length-1):end;

          //获取所有li元素
          var lis = $list.querySelectorAll('li');
          var childCount = $list.childElementCount;
          var min = Math.min(childCount-1,end);

          //把li元素放进fragCache缓存区，再进行处理
          for(var i = begin ; i <= min ; i++){
            $fragCache.appendChild(lis[i]);
          }
          //若li不够，则复制liCopy进缓存区来补足li
          for(;i <= end ; i++){
            var li = liCopy.cloneNode(true);
            $fragCache.appendChild(li);
          }
          //清除多余的li
          for(;i < childCount;i++){
            lis[i].remove();
          }

          //对缓存区的li进行处理渲染
          $fragCache.querySelectorAll('.songName-l').forEach(function (el,i) {
            el.innerText = $showData[i+begin].song;
          });
          $fragCache.querySelectorAll('.singer-l').forEach(function (el,i) {
            el.innerText = $showData[i+begin].singer+' / '+parseInt($showData[i+begin].time/60)+':'+$showData[i+begin].time%60;
          });

          if($type === 'search'|| $type === 'topList'){
            $fragCache.querySelectorAll('.delete').forEach(function (el) {
              el.style.display = 'inline';
            });
            $fragCache.querySelectorAll('.addToPlay').forEach(function (el) {
              el.style.display = 'inline';
            });
            $fragCache.querySelectorAll('.delete').forEach(function (el) {
              el.style.display = 'none';
            });
          }
          if($type === 'playList'){
            $fragCache.querySelectorAll('.delete').forEach(function (el) {
              el.style.display = 'inline';
            });
            $fragCache.querySelectorAll('.addToPlay').forEach(function (el) {
              el.style.display = 'none';
            });
            $fragCache.querySelectorAll('.delete').forEach(function (el) {
              el.style.display = 'inline';
            });
          }
          if($type === 'collect'){
            $fragCache.querySelectorAll('.delete').forEach(function (el) {
              el.style.display = 'none';
            });
            $fragCache.querySelectorAll('.addToPlay').forEach(function (el) {
              el.style.display = 'inline';
            });
            $fragCache.querySelectorAll('.delete').forEach(function (el) {
              el.style.display = 'inline';
            });
          }
          //在$fragCache渲染完成后，追加到列表中，并显示列表
          $list.appendChild($fragCache);
        }else{
          //显示无更多数据
          document.getElementById('listBottom').innerText = 'no more songs!';
        }
        $list.style.display = 'block';
      },
      //控制上下曲与暂停播放
      lastNextOrPause:function (choice,bool) {
        request({handler:'player',do:choice,value:bool},console.log);
      },
      modifyBar:function (choice,value) {
        request({handler:'player',do:choice,value:value},console.log)
      },
      //初始化UI界面
      initializeUI:function(){
        request({handler:'createUI'},refleshUI);
      }
    };
  }
  //实例容器
  var instance = undefined;
  return {
    //获取单例的方法
    getInstance:function(args){
      if(!instance)
        instance = new FrontHandler(args);
      return instance;
    }
  }
})();


