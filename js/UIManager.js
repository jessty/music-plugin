/**
 * Created by Y-Star on 2017/4/7.
 */
var UIManagerClass = (function(){
  function UIManager(frontHandler) {
    var $frontHandler = frontHandler;
    var $type = '';
    var $chosenEle = document.getElementById('topList').parentElement;
    var $choice = document.getElementById('choice');
    var $list = document.getElementById('listWrapper').querySelector('ul');
    var $listBottom = document.getElementById('listBottom');
    // var $fragCache = document.createDocumentFragment();
    //私有方法，刷新UI界面
    function $wrapTime(time){
      var strTime = '';
      while(time>60){
        var yushu = time%60;
        strTime = (yushu>9?':':':0') + yushu + strTime;
        time = Math.floor(time/60);
      }
      strTime = (time>9?':':':0') + time + strTime;
      return strTime.substring(1);
    }
    var $refleshUI = (function() {
      //缓存dom对象
      var bground = document.getElementById('background-blur');
      var pic = document.getElementById('pic');
      var titles = document.getElementById('title').querySelectorAll('span');
      var controlArea = document.getElementById('controlArea');
      var progressBar = controlArea.querySelector('.progressBar>div');
      var playBt = controlArea.querySelector('.playBt');
      var volumeBar = controlArea.querySelector('.volumeBar>div');

      var totalTime;
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
          pic.style.animation = '';
          titles[0].innerHTML = data.song.song;
          titles[1].innerHTML = data.song.singer;
          progressBar.style.width = data.progress * 100 + '%';
          progressBar.firstElementChild.title = '0 / ' + $wrapTime(data.song.time );
          volumeBar.style.width = data.volume * 100 + '%';
          volumeBar.firstElementChild.title = Math.round(data.volume*10) + ' / 10';
          console.log(data);

          //重新开始动画
          pic.offsetHeight;
          pic.style.animation = 'rotation ' + data.song.time / 2 + 's linear 0s infinite normal';
          if (!data.paused) {
            playBt.classList.remove('toPlay');
            playBt.classList.add('toPause');
          } else {
            playBt.classList.remove('toPause');
            playBt.classList.add('toPlay');
            pic.style.animationPlayState = 'paused';
          }
          totalTime = data.song.time;//存好当前播放的歌曲的总时间
        } else if (data.type == 'changeTime') {
          if(progressBar.dataset.modifiable == 'true'){
            progressBar.style.width = data.progress * 100 + '%';
            var curTime = Math.round(data.currentTime);
            // console.log(data);
            progressBar.querySelector('span').title = $wrapTime(curTime) + ' / ' +$wrapTime(totalTime);
          }
        }
      }
    })();
    // 插入 列表项lis
    var $buildLis = function (data) {
      var lis = '',spans = '',singer = '';
      switch($type){
        case 'topList': spans = '<span class="icons collect" title="收藏"></span><span class="icons addToPlay" title="待会播">';break;//列表中，歌曲项的delete（删除）按钮不显示
        case 'searchResult':  spans = '<span class="icons collect" title="收藏"></span><span class="icons addToPlay" title="待会播">';break;
        case 'collections': spans = '<span class="icons addToPlay" title="待会播"></span><span class="icons delete" title="移除">';break;//列表中，歌曲项的like（收藏）按钮不显示
        case 'playList':spans = '<span class="icons collect" title="收藏"></span><span class="icons delete" title="移除">';break;//列表中，歌曲项的addToPlay（下一曲播放）按钮不显示
      }
      data.forEach(function(e){
        singer = e.singer+' / ' + $wrapTime(e.time);
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
      return lis;
    };

    //请求结果渲染函数
    var $showResult = function (toCover,msg) {
      var lis = '';
      if(msg.code != 200){
        $listBottom.innerText = 'error!!!';
      }else{
        var data = msg.data;
        if(data.length < 8){
          $listBottom.innerText = 'no more data!';
        }
        lis = $buildLis(data);
      }
      if(toCover){
        lis = lis ? lis : '<li style="height:120px;border:0px;"></li>';
        //为了配合列表切换动画，把插入lis操作延迟250ms
        setTimeout(e=>{$list.innerHTML = lis;},250);
      }
      else
        $list.insertAdjacentHTML('beforeend',lis);
    };

    //列表类型切换时，用于清空列表和显示加载动画
    var $toggleList = (function(){
      var choices = ['topList','searchResult','playList','collections',''];
      var searchDir = 0;
      return function (oldType,newType) {

        var currentChosenEle = $choice.querySelector('#'+newType).parentElement;
        //在列表顶部选择区，进行按钮间样式切换
        currentChosenEle.classList.toggle('chosen');
        $chosenEle.classList.toggle('chosen');
        //关闭/打开搜索框
        (oldType != 'searchResult')||($chosenEle.firstElementChild.className = 'searchHidden');
        (newType != 'searchResult')||(currentChosenEle.firstElementChild.className = '');

        //对列表切换添加动画
        //针对newType==searchResult，进行专门处理
        if(newType == 'searchResult'){
          $list.className = '';
          //返回顶部，同时重新启动动画
          document.getElementById('listWrapper').scrollTop = 0;
          if(oldType == ''){
            //设计时，若oldType==''，说明第二次点击search按钮，要真正进行搜索；
            // 若oldType!=''，则是第一点击search按钮，只打开搜索框
            $list.className = searchDir<0 ? 'searchListFromRight' : 'searchListFromLeft';
          }else{
            //列表切换方向，-1--向左、1--向右
            var direction = choices.indexOf(newType)>choices.indexOf(oldType) ? -1 : 1;
            $list.className = direction<0 ? 'searchListToLeft' : 'searchListToRight';
            // $chosenEle.firstElementChild.className = '';
            //记录第一次点击search按钮时，search列表切换的方向
            searchDir = direction;
          }
        }else{
          //列表切换方向，-1--向左、1--向右
          var direction = choices.indexOf(newType)>choices.indexOf(oldType) ? -1 : 1;
          $list.className = '';
          //返回顶部，同时重新启动动画
          document.getElementById('listWrapper').scrollTop = 0;
          $list.className = direction<0 ? 'listToLeft' : 'listToRight';
        }
        $listBottom.innerText = '';
        $chosenEle = currentChosenEle;
      }
    })();
    //公有属性、方法
    return {
      get showType(){
        return $type;
      },
      set showType(newType){

        if(newType == 'searchResult'){
          //对searchResult类型进行专门处理，因为第一次点击search时，只是展示搜索框，还没有进行搜索，第二次点击才进行搜索；
          // 第一、二次的不同，用$type与newType来区分；
          // $type记录上一次选择的类型，若点击search按钮后，$type != 'searchResult',则是第一次点击
          if($type == 'searchResult'){
            // $list.style.animation = 'toggleListToLeft 0.3s ease-in-out 0s';
            // $list.style.animationFillMode = 'both';
            $toggleList('',newType);
            this.toLoadSongs(1);
          }else{
            $toggleList($type,newType);
            $type = newType;
          }

        }else{
          //对其他类型的处理
          if(newType != $type) {
            //切换歌曲列表时，清空列表
            $toggleList($type,newType);
            $type = newType;
            //设置好歌曲列表的显示类型后，加载对应类型的列表
            this.toLoadSongs(1);
          }
          else
            document.getElementById('listWrapper').scrollTop = 0;//返回顶部
        }

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
          case 'searchResult':{msg.key = $choice.querySelector('#searchResult').value;};break;
          case 'collections':{msg.do = 'load';};break;
          case 'playList':{msg.do = 'load';};break;
          case 'topList':;break;
          default:console.log('error in UIManager.toLoadSongs(): choice type(' + $type + ')is error!');break;
        }
        var showResult = page == 1 ? $showResult.bind(null,true):$showResult.bind(null,false);
        // $listBottom.innerText = 'loading . . .';
        $frontHandler.request(msg,showResult);
      },
      toPlayOnList:function (index) {
        var msg = {handler:'playList',do:'play',list:$type,index:index};
        $frontHandler.request(msg,console.log);
      },
      toCollect:function (index, ele) {
        var msg = {handler:'collections',do:'add',list:$type,index:index};
        $frontHandler.request(msg,function (msg) {
          if(msg && msg.code==200){
            ele.style.backgroundColor = 'red';
          }else{

          }
        });
      },
      toAddToPlay:function (index,ele) {
        var msg = {handler:'playList',do:'add',list:$type,index:index};
        $frontHandler.request(msg,function (msg) {
          if(msg && msg.code==200){
            ele.style.backgroundColor = 'red';
          }else{

          }
        });
      },
      toRemoveFromList:function (index,li) {
        var msg = {handler:$type,do:'delete',index:index};
        $frontHandler.request(msg,function (msg) {
          if(msg && msg.code==200){
            li.className = 'deleteLi';
            setTimeout(e=>{li.remove();},700);
          }else{

          }
        });
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