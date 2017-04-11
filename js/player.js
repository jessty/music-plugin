/**
 * Created by Y-Star on 2017/2/24.
 */

function Player(sharedData){
  this.$sharedData = sharedData;

  //核心播放器
  this.audio = document.createElement('audio');
  //监听播放结束事件 结束自动播放下一首（循环播放）
  this.audio.onended = e =>{
    this.playSongIndex = (this.$playSongIndex+1+this.playList.length)%this.playList.length;
  };

  //当歌曲缓冲到可以播放时，再播
  this.audio.oncanplay = e => {
    this.audio.play();
  };

  //获取歌曲媒体数据，如时长等
  this.audio.onloadedmetadata = e => {
    console.log('metadata: '+this.audio.duration);
  };

  //不断向UI更新进度
  this.audio.ontimeupdate = e => {
    try{
      chrome.runtime.sendMessage({
        code:200,
        data:{
          type:'changeTime',
          currentTime:this.audio.currentTime,
          progress:this.progress//有null出现！！！！！！！！！！！！
        }
      },function (response) {
            console.log(response);
      });
    }catch(e){
      //do nothing
    }
  };


}
Player.prototype = {
  playingSong:{
    album:' ',
    songPic:'./pics/test.jpg',
    songID:' ',
    time:0,
    song:'~~',
    singer:'~~'
  },
  errorSong:{
    album:' ',
    songPic:'./pics/test.jpg',
    songID:' ',
    time:0,
    song:'~~',
    singer:'~~'
  },
  $playSongIndex:undefined,
  playList:[],

  //设置播放的歌曲Index，可用于上一首下一首切歌
  get playSongIndex(){
    return this.$playSongIndex;
  },
  set playSongIndex(newval){
    this.$playSongIndex = (newval+this.playList.length)%this.playList.length;
    try{
      this.toplay(this.$playSongIndex);
      this.playingSong = this.playList[this.$playSongIndex];
      try{
        chrome.runtime.sendMessage({
          code:200,
          data:{    // 修改  加code？
            type:'changeSong',
            song:this.playingSong,
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
      this.playingSong = this.errorSong;
      try{
        chrome.runtime.sendMessage({
          code:500,
          data:{    // 修改  加code？
            type:'changeSong',
            song:this.errorSong,
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

  //准备播放（获取播放key、设置src、调用play()播放）
  toplay:function (index) {
    if(this.$sharedData.online == true){
      console.log('to  play');
      if('songID' in this.playList[index]){
        this.$playWithKey(this.playList[index].songID);
        console.log('play ID');
      }
      else{
        this.audio.src = this.playList[index].songSrc;
        this.audio.play();
      }
    }
    else{
      throw new Error("toplay error");
    }

  },
  //获取播放key
  $playWithKey:function (songID){
    var callback = function (responseData){
      responseData = JSON.parse(responseData);
      this.audio.src = 'http://cc.stream.qqmusic.qq.com/C100'+songID+'.m4a?vkey='+responseData.key+'&fromtag=0';
      this.audio.play();
    };
    // 把内部函数绑定到对象,使回调函数可以操作对象的audio
    callback = callback.bind(this);
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
      this.$sharedData.online = false;
      // throw new Error('player.$playWithKey:net Error');
    };
    request.onerror = e => {
      this.$sharedData.online = false;
      // throw new Error('player.$playWithKey:net Error');
    };
    request.send(null);
  },

  //选择歌曲列表作为播放列表，并播放所选歌曲
  playOnList:function (listName,index,callback) {
    if(listName in this.$sharedData && this.$sharedData[listName] instanceof Array){
      // 、、playList在sharedData变化时，要不要也变化，如果要变化，如何实现同步
      //选同一个列表另一首歌时，下面的本不需再做，playList不用再重新赋值更新
      this.playList = this.$sharedData[listName].map(function (el) {
        return el;
      });
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
    if(listName in this.$sharedData && this.$sharedData[listName] instanceof Array){
      //this.playSongIndex 初始值是？？当列表为空时添加歌曲有问题
      this.playList.splice(this.playSongIndex+1,0,this.$sharedData[listName][index]);
      callback(200,'已添加到播放列表');
    }else{
      callback(500,'添加到播放列表出错');
      new Error('add to playList error');
    }
  },
  //从播放列表删除歌曲
  notToPlay:function (index,callback) {
    this.playList.splice(index,1);
    callback(200,'已从播放列表删除');
  },
  //获取播放列表
  getPlayList:function(page,response){
    let length = this.playList.length;
    if(length === 0){
      response(200,[]);
    }
    else {
      let begin = (page - 1)*8;
      let end = begin + 7;
      let lastIndex = length - 1;
      if(begin <= lastIndex){
        end = (end <= lastIndex ? end : lastIndex);
        response(200,this.playList.slice(begin,end+1));
      }else{
        response(200,[]);
      }
    }
  },
  //进度调整
  get progress(){
    return this.audio.currentTime/this.audio.duration;
  },
  set progress(progress) {
    this.audio.currentTime = progress*this.audio.duration;
  },
  // 调整音量
  get volume(){
    return this.audio.volume;
  },
  set volume(newValue){
    if(newValue == 0)
      this.audio.muted = true;
    else if(this.audio.muted == true){
      this.audio.muted = false;
      this.audio.volume = newValue;
    }
    else{
      this.audio.volume = newValue;
    }
  },

  //暂停与否（包含播放）
  get paused(){
    return this.audio.paused;
  },
  set paused(bool){
    bool?this.audio.pause():this.audio.play();
  }
};