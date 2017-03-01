/**
 * Created by Y-Star on 2017/2/23.
 */
function Storage(){
    Storage.prototype = {
        collections:[],

    // 收藏歌曲
        collect:function (song) {
            var obj = {};
            if('songID' in song)
                obj[song.songID] = song;
            else
                obj[song.songSrc] = song;
            chrome.storage.local.set(obj,function () {
                console.log('collect OK!');
            });
        },

    // 从收藏列表中移除歌曲
        abandon:function (id) {
            chrome.storage.local.remove(id,function () {
                console.log('abandon OK');
            });
        },

    // 首次从在chrome.storage中储存的收藏夹中加载所有歌曲
    // 只执行一次，在用户第一次点击收藏夹时，之后维护好所加载的歌曲列表
        load:function () {
            this.collections = [];
            chrome.storage.local.get(null,objToArray);
            function objToArray(obj) {
                for(var item in obj){
                    this.collections.push(obj[item]);
                }
            }
        }
    }
}







