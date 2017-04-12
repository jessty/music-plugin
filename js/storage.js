/**
 * Created by Y-Star on 2017/2/23.
 */
function Storage(sharedData){
  //获取外界对象，以获得对它的操作权
  var expired = false;
  var $sharedData = sharedData;
  return {
    collections:[],
    // 收藏歌曲
    collect:function (list,index,callback) {    // 修改  不传输song数据 传type和index？
      var obj = {};
      console.log('collect song from :'+list);
      var song = $sharedData[list][index];      // 修改  加判断sharedData是否有list列表？
      if('songID' in song)
        obj[song.songID] = song;
      else
        obj[song.songSrc] = song;
      chrome.storage.local.set(obj,e => {
        callback(200,[]);
        //缓存的收藏夹标记为失效
        expired = true;
        console.log('collect OK!');
      });
    },

    // 从收藏列表中移除歌曲
    abandon:function (index,callback) {
      var deletingSong = $sharedData.collections[index];
      var id = deletingSong.songID||deletingSong.songSrc;
      chrome.storage.local.remove(id,e => {
        callback(200,[]);
        //为了$sharedData.collections的数据与chrome存着的数据一致，在chrome完成删除后，才执行$sharedData.collections的删除
        $sharedData.collections.splice(index,1);
        //此时数据已一致，不用设置$sharedData.collections过期(expired=true)
        console.log('abandon OK');
      });
    },

    // 从在chrome.storage中储存的收藏夹中加载所有歌曲
    load:function (callback) {
      console.log($sharedData);
      console.log('collection expired : '+expired);
      //数据失效 或者 首次加载（$sharedData.collections为undefined）
      if((!$sharedData.collections) || (expired)){
        //清空collections数据
        this.collections = null;
        this.collections = [];
        var objToArray = function (obj) {
          for(var item in obj){
            this.collections.push(obj[item]);
          }
          if(callback)
            callback(this.collections);
          $sharedData.collections = this.collections;
        };
        objToArray = objToArray.bind(this);
        chrome.storage.local.get(null,objToArray);
      }else{
        callback($sharedData.collections);
      }
    }
  }
}






