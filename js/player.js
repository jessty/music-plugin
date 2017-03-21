/**
 * Created by Y-Star on 2017/2/24.
 */

function Player(sharedData,port){
  this.$sharedData = sharedData;

  //核心播放器
  this.audio = document.createElement('audio');

  //监听播放结束事件 结束自动播放下一首（循环播放）
  this.audio.onended = e =>{
    this.playSong = (this.$playSongIndex+1+this.playList.length)%this.playList.length;
  };

  //当歌曲缓冲到可以播放时，再播
  this.audio.oncanplay = e => {
    this.audio.play();
  };

  //获取歌曲媒体数据，如时长等
  this.audio.onloadedmetadata = e => {
    console.log(this.audio.duration);
  };

  //不断向UI更新进度
  this.audio.ontimeupdate = e => {
    // port.postMessage({currentTime:this.audio.currentTime/this.audio.duration});
  };


}
Player.prototype = {
  playList:[],
  $playSongIndex:undefined,
  //设置播放的歌曲Index，可用于上一首下一首切歌
  get playSong(){
    return this.$playSongIndex;
  },
  set playSong(newval){
    this.$playSongIndex = (newval+this.playList.length)%this.playList.length;
    this.toplay(this.$playSongIndex);
  },

  //准备播放（获取播放key、设置src、调用play()播放）
  toplay:function (index) {
    if('songID' in this.playList[index]){
      this.$playWithKey(this.playList[index].songID);
      console.log('play ID');
    }
    else{
      this.audio.src = this.playList[index].songSrc;
      this.audio.play();
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
        throw new Error('404');
      }
    };
    request.ontimeout = function(){
      throw new Error('timeout');
    };
    request.send(null);
  },

  //选择歌曲列表作为播放列表，并播放所选歌曲
  playOnList:function (listName,index) {
    if(listName in this.$sharedData && this.$sharedData[listName] instanceof Array){
      // 、、playList在sharedData变化时，要不要也变化，如果要变化，如何实现同步
      //选同一个列表另一首歌时，下面的本不需再做，playList不用再重新赋值更新
      this.playList = this.$sharedData[listName].map(function (el) {
        return el;
      });
      this.playSong = index;
    }else{
      new Error('playList error');
    }
  },
  //添加歌曲到播放列表
  addToPlay:function (listName,index,callback) {
    if(listName in this.$sharedData && this.$sharedData[listName] instanceof Array){
      this.playList.splice(this.playSong+1,0,this.$sharedData[listName][index]);
      callback('已添加到播放列表');
    }else{
      new Error('add to playList error');
    }
  },
  //从播放列表删除歌曲
  notToPlay:function (index,callback) {
    this.playList.splice(index,1);
    callback('OK,delete');
  },
  //获取播放列表
  getPlayList:function(callback){
    if(this.playList.length === 0){
      callback('There isn\'t a song to be played');
    }
    else callback(this.playList);
  },
  //进度调整
  setProgress:function (progress) {
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
      this.audio.volume = newValue/10;
    }
    else{
      this.audio.volume = newValue/10;
    }
  },

  //暂停与否（包含播放）
  set pause(bool){
    bool?this.audio.pause():this.audio.play();
  }
};