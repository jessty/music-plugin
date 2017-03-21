/**
 * Created by Y-Star on 2017/3/11.
 */
function BackHandler(player,storage,network,sharedData) {
  this.player = player;
  this.storage = storage;
  this.network = network;
  this.sharedData = sharedData;
}
BackHandler.prototype = {

  //监听通信
  listen:function (progressPort) {
    progressPort.onMessage.addListener(function (msg, port) {
      if(port.name == 'front')
        this.player.setProgress(msg.progress);
    });
    console.log(this);
    var router = this.router.bind(this);
    chrome.runtime.onMessage.addListener(router);
  },

  //通信转发路由
  router:function(message,sender,sendResponse){
    console.log(this);
    switch (message.handler)
    {
      case 'search':this.searchHandler(message.key,message.page,sendResponse); console.log('search connect');break;//search
      case 'topList':this.getTopListHandler(message,sendResponse);console.log('topList connect');break;//get top songs' list
      case 'collect':this.collectionsHandler(message,sendResponse);console.log('collect connect');break;//get collections
      case 'playList':this.playListHandler(message,sendResponse);console.log('playList connect');break;//处理播放列表相关的操作：1.点击歌曲时，选其所在列表作为播放列表
        //2.添加歌曲为待会播放  3.从播放列表移除歌曲  4.获取播放列表
      case 'player':this.playerHandler(message,sendResponse);console.log('player connect');break;//设置player，如：上下曲，暂停播放，调整音量
    }
    return true;
  },

  //搜索处理器，主要进行异常处理和过滤
  searchHandler:function (key,page,sendResponse) {
    try{
      if(page == 1)
        this.sharedData.searchResult = undefined;                          //把搜索第一页结果，都当作新请求，清空之前的搜索结果
      this.network.search(key,page,sendResponse);                          //search songs ，传入sendResponse以便得到结果后返回数据给页面
    }
    catch (e){
      switch(e.message)
      {
        case 'timeout':sendResponse('“我一步一步往上爬”----网络儿哼唱');break;
        case 'error':sendResponse('网络儿罢工了！');break;
      }
    }
  },

  //排行榜处理器，主要进行异常处理和过滤
  getTopListHandler:function (msg,sendResponse) {
    try {
      if (this.sharedData.topList === undefined || this.sharedData.topList.length === 0) {//没有topLsit数据，尝试获取
        this.network.getTopList(sendResponse, 1);
      }
      else if(msg.page == 1){                                            //有topList数据，若只要第一页，则把已缓存的数据直接返回
        sendResponse(this.sharedData.topList);
      }else{
        this.network.getTopList(sendResponse, msg.page);                      //有topList数据，若要其他页，尝试获取
      }
    }catch (e){
      switch(e.message)
      {
        case 'timeout':sendResponse('“我一步一步往上爬”----网络儿哼唱');break;
        case 'error':sendResponse('网络儿罢工了！');break;
      }
    }
  },

  //关于收藏的处理器
  collectionsHandler:function (message,sendResponse) {
    if(message.do === 'add'){                                        //添加歌曲到收藏夹
      this.storage.collect(message.song,sendResponse);
      return;
    }

    if(message.do === 'delete'){                                     //从收藏夹删歌曲
      this.storage.abandon(message.songID,sendResponse);
      return;
    }

    var responseFilter = function(result){
      if(result.length == 0){                                        //加载收藏夹时，对结果进行筛选
        sendResponse('收藏夹空空的，正饥渴地望着你~~');
      }else{
        sendResponse(result);
      }
    };
    if(message.do === 'load'){
      if(this.sharedData.collections === undefined){
        this.storage.load(responseFilter);
      }
      else if(this.sharedData.collections.length==0){
        sendResponse('收藏夹空空的，正饥渴地望着你~~');
      }
      else{
        sendResponse(this.sharedData.collections);
      }
    }
  },

  //专门用于操作播放列表
  playListHandler:function (message,sendResponse){
    switch(message.do)
    {
      case 'play':this.player.playOnList(message.list,message.index);break;
      case 'add':this.player.addToPlay(message.list,message.index,sendResponse);break;
      case 'delete':this.player.notToPlay(message.index,sendResponse);break;
      case 'load':this.player.getPlayList(sendResponse);break;
    }
  },

  //用于对播放器进行设置
  playerHandler:function (message,sendResponse){
    switch(message.do)
    {
      case 'pause':this.player.pause = message.bool;break;
      case 'volumn':this.player.volume = message.volumn;break;
      case 'last':this.player.playSong--;break;
      case 'next':this.player.playSong++;break;
    }
  }
}