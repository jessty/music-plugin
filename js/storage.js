/**
 * Created by Y-Star on 2017/2/23.
 */
function Storage(sharedData){
  //获取外界对象，以获得对它的操作权
  this.$sharedData = sharedData;
}
Storage.prototype = {
  collections:[],
  // 收藏歌曲
  collect:function (song,callback) {    // 修改  不传输song数据 传type和index？
    var obj = {};
    if('songID' in song)
      obj[song.songID] = song;
    else
      obj[song.songSrc] = song;
    chrome.storage.local.set(obj,e => {
      callback(200,[]);
      this.$sharedData.collections = this.collections = undefined;//缓存的收藏夹设为失效
      console.log('collect OK!');
    });
  },

  // 从收藏列表中移除歌曲
  abandon:function (id,callback) {
    chrome.storage.local.remove(id,e => {
      callback(200,[]);
      this.$sharedData.collections = this.collections = undefined;//缓存的收藏夹设为失效
      console.log('abandon OK');
    });
  },

  // 从在chrome.storage中储存的收藏夹中加载所有歌曲
  load:function (callback) {
    this.collections = [];
    var objToArray = function (obj) {
      for(var item in obj){
        this.collections.push(obj[item]);
      }
      if(callback)
        callback(this.collections);
      this.$sharedData.collections = this.collections;
    };
    objToArray = objToArray.bind(this);
    chrome.storage.local.get(null,objToArray);
  }
}






