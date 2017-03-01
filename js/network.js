/**
 * Created by Y-Star on 2017/2/22.
 */
function Network(){
    Network.prototype = {
        searchResult:[],
        topList:[],
        playKey:'',
        request:function (url,method,callback,data){
            var request = new XMLHttpRequest();
            request.open(method,url);
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
            if(data===undefined)
                request.send(null);
            else
                request.send(data);
        },
        search:function (keyword,page){
            this.searchResult = [];/////////////////Object Property//////////////////////////////////////
            var filter = function (responseData){
                responseData = JSON.parse(responseData);
                var responseList = responseData.data.song.list;
                var details = [];
                for(var i=0 ;i<responseList.length;i++){
                    var song = {};
                    song.song = responseList[i].fsong;
                    if(responseList[i].fsinger2 == undefined || responseList[i].fsinger2 == ''){
                        song.singer = responseList[i].fsinger;
                    }else{
                        song.singer = responseList[i].fsinger+'/'+responseList[i].fsinger2;
                    }
                    if(responseList[i].f.indexOf('@@')!=-1){
                        details = responseList[i].f.split('@@');
                        song.album = '';
                        song.time = parseInt(details[7]);
                        song.songSrc = details[8];
                        song.songPic = 'https://y.gtimg.cn/mediastyle/yqq/extra/player_cover.png?max_age=31536000';
                    }else{
                        details = responseList[i].f.split('|');
                        song.album = (details[5]=='空')?'':details[5];
                        song.time = parseInt(details[7]);
                        song.songID = details[20];
                        song.songPic = 'https://y.gtimg.cn/music/photo_new/T002R90x90M000' + details[22] + '.jpg?max_age=2592000';
                    }
                    this.searchResult.push(song);/////////////////Object Property//////////////////////////////////////
                }
            };
            // 把内部函数绑定到对象
            filter = filter.bind(this);
            var url = 'http://s.music.qq.com/fcgi-bin/music_search_new_platform?' +
                't=0&n=8&aggr=1&cr=1&loginUin=0&format=json&inCharset=GB2312&outCharset=utf-8&notice=0&platform=jqminiframe.json&'+
                'needNewCode=0&p='+page+'&catZhida=0&remoteplace=sizer.newclient.next_song&w='+keyword;
            this.request(url,'GET',filter);
        },
        getTopList:function (page){
            this.topList = [];/////////////////Object Property//////////////////////////////////////
            var filter = function (responseData){
                responseData = JSON.parse(responseData);
                var songsList = responseData.songlist;
                for(var i=0 ; i<songsList.length ; i++){
                    var song = {};
                    var eachSong = songsList[i].data;
                    song.album = eachSong.albumname;
                    song.songPic = 'https://y.gtimg.cn/music/photo_new/T002R90x90M000' + eachSong.albummid + '.jpg?max_age=2592000';
                    song.songID = eachSong.strMediaMid;
                    song.time = eachSong.interval;
                    song.song = eachSong.songname;
                    song.singer = '';
                    // console.log(typeof songsList.singer);
                    for(var j=0 ; j<eachSong.singer.length ; j++){
                        song.singer += eachSong.singer[j].name + '&';
                    }
                    song.singer = song.singer.substring(0,(song.singer.length-1));
                    this.topList.push(song);
                }
            };
            // 把内部函数绑定到对象
            filter = filter.bind(this);
            var url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?'+
                'tpl=3&page=detail&date=2017_07&topid=26&type=top&song_begin='+(page - 1) * 6+'&song_num=8&g_tk=5381&'+
                'loginUin=0&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0';
            this.request(url,'GET',filter);

        },
        getPlayKey:function (){
            // var playKey = '';
            this.playKey = '';
            var filter = function (responseData){
                responseData = JSON.parse(responseData);
                this.playKey = responseData.key;
            };
            // 把内部函数绑定到对象
            filter = filter.bind(this);
            var url = 'http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?' +
                'json=3&loginUin=0&format=json&inCharset=GB2312&outCharset=GB2312&notice=0&platform=yqq&needNewCode=0';
            this.request(url,'GET',filter);
        }
    }
}

var net = new Network();



