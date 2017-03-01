/**
 * Created by Y-Star on 2017/2/24.
 */
function Player(){
  this.audio = document.createElement('audio');
  this.audio.onended = function(){
    this.playSong = (this.$playSongIndex+1)%this.playList.length;
  };
  this.audio.ontimeupdate = function(){
    send(this.audio.currentTime);
  }

}
Player.prototype = {
  playList:[],
  $playSongIndex:undefined,
  //设置播放的歌曲Index，可用于上一首下一首切歌
  get playSong(){
    return this.$playSongIndex;
  },
  set playSong(newval){
    this.$playSongIndex = newval;
    this.toplay(newval);
  },
  toplay:function (index) {
    if('songID' in this.playList[index]){
      this.$playWithKey(this.playList[index].songID);
      console.log('play ID');
    }else{
      this.audio.src = song.songSrc;
      this.audio.play();
    }
  },
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

  //暂停与否
  set pause(bool){
    bool?this.audio.pause():this.audio.play();
  },

}