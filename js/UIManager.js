/**
 * Created by Y-Star on 2017/4/7.
 */
var UIManagerClass = (function(){
  function UIManager(frontHandler) {
    var $frontHandler = frontHandler;
    var $type = '';
    var $searchKey = '';
    var $page = 0;
    var $list = document.getElementById('listWrapper').querySelector('ul');
    var $animation = document.getElementById('animation');
    var $listBottom = document.getElementById('listBottom');
    // var $fragCache = document.createDocumentFragment();
    //私有方法，刷新UI界面
    var $refleshUI = (function() {
      //缓存dom对象
      var bground = document.getElementById('background-blur');
      var pic = document.getElementById('pic');
      var titles = document.getElementById('title').querySelectorAll('span');
      var controlArea = document.getElementById('controlArea');
      var progressBar = controlArea.querySelector('.progressBar>div');
      var playBt = controlArea.querySelector('.playBt');
      var volumeBar = controlArea.querySelector('.volumeBar>div');
      //返回实际刷新UI界面方法
      return function (msg) {
        var data = msg.data;
        if (data.type == 'createUI' || data.type == 'changeSong') {

          var picUrl = '';
          if(data.song.songPic[0] == '.')
            picUrl = 'url('+data.song.songPic+')';
          else
            picUrl = 'url(https://y.gtimg.cn/music/photo_new/T002R300x300M000' + data.song.songPic + '.jpg?max_age=2592000)';
          bground.style.backgroundImage = picUrl;
          pic.style.backgroundImage = picUrl;
          pic.style.animation = 'rotation ' + data.song.time / 2 + 's linear 0s infinite normal';
          titles[0].innerText = data.song.song;
          titles[1].innerText = data.song.singer;
          progressBar.style.width = data.progress * 100 + '%';
          volumeBar.style.width = data.volume * 100 + '%';
          if (!data.paused) {
            playBt.classList.remove('toPlay');
            playBt.classList.add('toPause');
          } else {
            playBt.classList.remove('toPause');
            playBt.classList.add('toPlay');
          }
        } else if (data.type == 'changeTime') {
          if(progressBar.dataset.modifiable == 'true'){
            progressBar.style.width = data.progress * 100 + '%';
            var curTime = Math.round(data.currentTime);
            progressBar.querySelector('span').title = Math.floor(curTime/60) + ':' + curTime % 60 + ' / ';
          }
        }
      }
    })();
    // 插入 列表项lis
    var $insertLis = function (data) {
      var lis = '',spans = '',singer = '';
      switch($type){
        case 'topList': spans = '<span class="icons collect" title="收藏"></span><span class="icons addToplay" title="待会播">';break;//列表中，歌曲项的delete（删除）按钮不显示
        case 'searchRsult':  spans = '<span class="icons collect" title="收藏"></span><span class="icons addToplay" title="待会播">';break;
        case 'collections': spans = '<span class="icons addToplay" title="待会播"></span><span class="icons delete" title="移除">';break;//列表中，歌曲项的like（收藏）按钮不显示
        case 'playList':spans = '<span class="icons collect" title="收藏"></span><span class="icons delete" title="移除">';break;//列表中，歌曲项的addToPlay（下一曲播放）按钮不显示
      }
      data.forEach(function(e){
        singer = e.singer+' / '+parseInt(e.time/60)+':'+e.time%60;
        // 构造歌曲列表项lis
        lis +=
            '<li>'+
            '<p class="songName-l">' + e.song + '</p>'+
              '<div>'+
                '<div class="singer-l">' + singer + '</div>'+
                '<div class="songOperate">' + spans + '</div>'+
              '</div>'+
            '</li>';
      });
      $list.insertAdjacentHTML('beforeend',lis);
    };

    //请求结果渲染函数
    var $showResult = function (msg) {
      if(msg.code != 200){
        $listBottom.innerText = 'error!!!';
      }else{
        var data = msg.data;
        if(data.length == 0){
          $listBottom.innerText = 'no more data!';
        }else
          $insertLis(data);
      }
      $list.style.display = 'block';
      $animation.style.display = 'none';
    };
    //列表类型切换时，用于清空列表和显示加载动画
    var $clearList = function () {
      $list.style.display = 'none';
      $animation.style.display = 'block';
      // $fragCache.appendChild($list);
      $list.innerText = '';
    };
    //公有属性、方法
    return {
      get showType(){
        return $type;
      },
      set showType(newType){
        if(newType != $type) {
          $type = newType;
          //切换歌曲列表时，清空列表
          $clearList();
          //设置好歌曲列表的显示类型后，加载对应类型的列表
          // this.toLoadSongs(1);
        }
        document.getElementById('listWrapper').scrollTop = 0;//返回顶部
      },
      toListen:function () {
        if($frontHandler)
          $frontHandler.listen($refleshUI);
        else
          throw new Error('$frontHandler is undefined');
      },
      toLoadSongs:function (page) {
        var msg = {
          handler:$type,
          page:page
        };
        switch($type){
          case 'searchResult':{msg.key = $searchKey;};break;
          case 'collections':{msg.do = 'load';};break;
          case 'playList':{msg.do = 'load';};break;
          case 'topList':;break;
          default:console.log('error in UIManager.toLoadSongs(): choice type(' + $type + ')is error!');break;
        }
        $frontHandler.request(msg,$showResult);
      },
      toPlayOnList:function (index) {
        var msg = {handler:'playList',do:'play',list:$type,index:index};
        $frontHandler.request(msg,console.log);
      },
      //初始化UI界面
      initializeUI:function(){
        console.log('initialize UI  2');
        console.log($frontHandler);
        $frontHandler.request({handler:'createUI'},$refleshUI);
      }
    }
  }
  var $instance = undefined;
  return {
    getInstance:function(){
      if(!$instance){
        var frontHandler = FrontHandlerClass.getInstance();
        $instance = new UIManager(frontHandler);
        $instance.toListen();
        $instance.initializeUI();
        console.log('initialize UI  1');
      }
      return $instance;
    }
  }
})();