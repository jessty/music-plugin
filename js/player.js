/**
 * Created by Y-Star on 2017/2/24.
 */

function Player(sharedData){
  var $sharedData = sharedData,$playList = [];
  $sharedData.playList = $playList;
  var $playSongIndex = undefined;
  var $notPlaySong = {
    album:' ',
    songPic:'./pics/notplay.jpg',
    songID:' ',
    time:0,
    song:'no song',
    singer:'is playing!'
  };
  var $errorSong = {
    album:' ',
    songPic:'./pics/errorSong.jpg',
    songID:' ',
    time:0,
    song:'error',
    singer:'occurred!'
  };
  var $playingSong = $notPlaySong;

  //核心播放器
  var $audio = document.createElement('audio');
  $audio.volume = 0.5;
  //准备播放（获取播放key、设置src、调用play()播放）
  function $toplay(index) {
    if($sharedData.online == true){
      console.log('to  play');
      if('songID' in $playList[index]){
        $playWithKey($playList[index].songID);
        console.log('play ID');
      }
      else{
        $audio.src = $playList[index].songSrc;
        $audio.play();
      }
    }
    else{
      throw new Error("toplay error");
    }

  };
  //获取播放key
  function $playWithKey(songID){
    var callback = function (responseData){
      responseData = JSON.parse(responseData);
      $audio.src = 'http://cc.stream.qqmusic.qq.com/C100'+songID+'.m4a?vkey='+responseData.key+'&fromtag=0';
      $audio.play();
    };
    // 把内部函数绑定到对象,使回调函数可以操作对象的audio
    // callback = callback.bind(this);
    var url = 'http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?' +
        'json=3&loginUin=0&format=json&inCharset=GB2312&outCharset=GB2312&notice=0&platform=yqq&needNewCode=0';
    var request = new XMLHttpRequest();
    request.open('GET',url);
    request.onload = function(){
      if(request.status === 200){
        callback(request.responseText);
      }else{
        // throw new Error('player.$playWithKey:net Error');
      }
    };
    request.ontimeout = e => {
      $sharedData.online = false;
      // throw new Error('player.$playWithKey:net Error');
    };
    request.onerror = e => {
      $sharedData.online = false;
      // throw new Error('player.$playWithKey:net Error');
    };
    request.send(null);
  };

  var $playerInterface = {
    get playingSong(){//修改 统一正在播放的歌曲
      return $playingSong;
    },
    //设置播放的歌曲Index，可用于上一首下一首切歌
    get playSongIndex(){
      return $playSongIndex;
    },
    set playSongIndex(newval){
      try{
        if(newval == undefined){
          $playSongIndex = undefined;
          $playingSong = $notPlaySong;
        }
        else{
          $playSongIndex = (newval + $playList.length) % $playList.length;
          $playingSong = $playList[this.playSongIndex];
          $toplay(this.playSongIndex);
        }
        try{
          chrome.runtime.sendMessage({
            code:200,
            data:{    // 修改  加code？
              type:'changeSong',
              song:$playingSong,
              progress:0,
              volume:this.volume,
              paused:false
            }
          },function (response) {
            console.log(response);
          });
        }catch(e){
          //do nothing
        }
      }
      catch(e){//还要修改图标？？？？
        $playingSong = $errorSong;
        try{
          chrome.runtime.sendMessage({
            code:500,
            data:{    // 修改  加code？
              type:'changeSong',
              song:$errorSong,
              progress:0,
              volume:this.volume,
              paused:true
            }
          },function (response) {
            console.log(response);
          });
        }catch(e){
          //do nothing
        }
      }
    },

    //选择歌曲列表作为播放列表，并播放所选歌曲
    playOnList:function (listName,index,callback) {
      if(listName in $sharedData && $sharedData[listName] instanceof Array){
        // 、、playList在sharedData变化时，不要随之变化
        //选同一个列表另一首歌时，下面的本不需再做，playList不用再重新赋值更新
        $playList = $sharedData[listName].map(function (el) {
          return el;
        });
        $sharedData.playList = undefined;
        $sharedData.playList = $playList;
        this.playSongIndex = index;
        callback(200,'歌曲已播放')
      }else if(listName == 'playList') {
        this.playSongIndex = index;
        callback(200, '歌曲已播放')
      }else{
        callback(500,'歌曲播放出错 '+listName);
        new Error('playList error');
      }
    },
    //添加歌曲到播放列表
    addToPlay:function (listName,index,callback) {
      if(listName in $sharedData && $sharedData[listName] instanceof Array){
        //this.playSongIndex 初始值是undefined，即没有正在播放的歌曲，意味着播放列表为空，为了增加用户体验，添加到空播放列表的第一首歌会自动播放
        if(this.playSongIndex == undefined){
          //由于this.playList与$sharedData.playList指向的是同一数组对象，所以两者是隐含着状态同步，此处的修改便不再操作$sharedData.playList
          $playList.splice(0,0,$sharedData[listName][index]);
          this.playSongIndex = 0;
        }
        else{
          $playList.splice(this.playSongIndex + 1,0,$sharedData[listName][index]);
        }
        callback(200,'已添加到播放列表');
      }else{
        callback(500,'添加到播放列表出错');
        new Error('add to playList error');
      }
    },
    //从播放列表删除歌曲
    notToPlay:function (index,callback) {
      //如果移除的歌曲就是正在播放的歌曲，则先从列表移除出歌曲，再播放下一首歌
      //把index下标的歌移除后，下一首歌前移，下标也是index（还要考虑下移除正在播放的歌是最后一首歌的情况）
      if(this.playSongIndex == index){
        $playList.splice(index,1);
        //列表长度为0时，设置playSongIndex为undefined
        this.playSongIndex = $playList.length == 0 ? undefined : (index % $playList.length);
      }
      else
        $playList.splice(index,1);
      callback(200,'已从播放列表删除');
    },
    //获取播放列表
    getPlayList:function(page,response){
      let length = $playList.length;
      if(length === 0){
        response(200,[]);
      }
      else {
        let begin = (page - 1)*8;
        let end = begin + 7;
        let lastIndex = length - 1;
        if(begin <= lastIndex){
          end = (end <= lastIndex ? end : lastIndex);
          response(200,$playList.slice(begin,end+1));
        }else{
          response(200,[]);
        }
      }
    },
    //进度调整
    get progress(){
      return $audio.currentTime / $audio.duration;
    },
    set progress(progress) {
      $audio.currentTime = progress * $audio.duration;
    },
    // 调整音量
    get volume(){
      return $audio.volume;
    },
    set volume(newValue){
      if(newValue == 0)
        $audio.muted = true;
      else if($audio.muted == true){
        $audio.muted = false;
        $audio.volume = newValue;
      }
      else{
        $audio.volume = newValue;
      }
    },

    //暂停与否（包含播放）
    get paused(){
      return $audio.paused;
    },
    set paused(bool){
      bool?$audio.pause():$audio.play();
    }
  };
  //监听播放结束事件 结束自动播放下一首（循环播放）
  $audio.onended = e =>{
    $playerInterface.playSongIndex = ($playerInterface.playSongIndex + 1 + $playList.length) % $playList.length;
  };

  //当歌曲缓冲到可以播放时，再播
  $audio.oncanplay = e => {
    $audio.play();
  };

  //获取歌曲媒体数据，如时长等
  $audio.onloadedmetadata = e => {
    console.log('metadata: '+$audio.duration);
  };

  //不断向UI更新进度
  $audio.ontimeupdate = e => {
    try{
      chrome.runtime.sendMessage({
        code:200,
        data:{
          type:'changeTime',
          currentTime:$audio.currentTime,
          progress:$playerInterface.progress//有null出现！！！！！！！！！！！！
        }
      },function (response) {
        console.log(response);
      });
    }catch(e){
      //do nothing
    }
  };
  return $playerInterface;
}