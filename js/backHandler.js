/**
 * Created by Y-Star on 2017/3/11.
 */
function BackHandler(player,storage,network,sharedData) {
  this.player = player;
  this.storage = storage;
  this.network = network;
  this.sharedData = sharedData;
  function reposneWrap(code,data) {
    response({code:code,data:data});
  }
}
BackHandler.prototype = {

  //监听通信
  listen:function () {
    var router = this.router.bind(this);
    chrome.runtime.onMessage.addListener(router);
  },
  send:function (msg) {
    chrome.runtime.sendMessage(msg,function () {
      console.log('backHandler send msg successfully');
    });
  },
  //通信转发路由
  router:function(message,sender,responseCore){
    function response(code,data) {
      responseCore({code:code,data:data});
    }
    switch (message.handler)
    {
      case 'createUI':this.createUI(response); console.log('createUI connect');break;
      case 'searchResult':this.searchHandler(message,response); console.log('search connect');break;//search
      case 'topList':this.getTopListHandler(message,response);console.log('topList connect');break;//get top songs' list
      case 'collections':this.collectionsHandler(message,response);console.log('collect connect');break;//get collections
      case 'playList':this.playListHandler(message,response);console.log('playList connect');break;//处理播放列表相关的操作：1.点击歌曲时，选其所在列表作为播放列表
        //2.添加歌曲为待会播放  3.从播放列表移除歌曲  4.获取播放列表
      case 'player':this.playerHandler(message,response);console.log('player connect');break;//设置player，如：上下曲，暂停播放，调整音量
      default:console.log('error in backHandler.router(): msg.Handler(' + $type + ')is error!');response();
    }
    return true;
  },
  createUI:function(response){
    var UIInfo = {        // 修改  加code？
      type:'createUI',
      song:this.player.playingSong,
      progress:this.player.progress,
      volume:this.player.volume,
      paused:this.player.paused
    };
    response(200,UIInfo);
  },
  //搜索处理器，主要进行异常处理和过滤
  searchHandler:function (msg,response) {
    try{
      if(msg.page == 1){
        this.sharedData.searchResult = undefined;     //把搜索第一页结果，都当作新请求，清空之前的搜索结果
        this.network.search(msg.key,msg.page,response);
      }else{
        let begin = (msg.page - 1)*8;
        let end = begin + 7;
        let lastIndex = this.sharedData.searchResult.length - 1;
        if(begin <= lastIndex){
          end = (end <= lastIndex ? end : lastIndex);
          response(200,this.sharedData.searchResult.slice(begin,end+1));   // 若缓存中有足够的数据，则从缓存中获取
        }else{
          this.network.search(msg.key,msg.page,response);     // 否则，发送网络请求，获取更多的数据
        }
      }

    }
    catch (e){
      switch(e.message)
      {
        case 'timeout':response(504,[]);break;
        case 'error':response(502,[]);break;
      }
    }
  },

  //排行榜处理器，主要进行异常处理
  getTopListHandler:function (msg,response) {
    try {
      if (this.sharedData.topList === undefined || this.sharedData.topList.length === 0) {//没有topLsit数据，尝试获取
        this.network.getTopList(response, 1);
      }
      else {
        let begin = (msg.page - 1)*8;
        let end = begin + 7;
        let lastIndex = this.sharedData.topList.length - 1;
        if(begin <= lastIndex){
          end = (end <= lastIndex ? end : lastIndex);
          response(200,this.sharedData.topList.slice(begin,end+1));   // 若缓存中有足够的数据，则从缓存中获取
        }else{
          this.network.getTopList(response, msg.page);     // 否则，发送网络请求，获取更多的数据
        }
      }
    }catch (e){
      switch(e.message)
      {
        case 'timeout':response(504,[]);break;
        case 'error':response(502,[]);break;
      }
    }
  },

  //关于收藏的处理器
  collectionsHandler:function (msg,response) {
    if(msg.do === 'add'){                                        //添加歌曲到收藏夹
      this.storage.collect(msg.list,msg.index,response);
      return;
    }

    if(msg.do === 'delete'){                                     //从收藏夹删歌曲
      this.storage.abandon(msg.index,response);
      return;
    }

    var responseFilter = function(list){
      if(list.length == 0){                                        //收藏夹为空时，返回空数组
        response(200,[]);
      }else{
        let begin = (msg.page - 1)*8;
        let end = begin + 7;
        let lastIndex = list.length - 1;
        if(begin <= lastIndex){
          end = (end <= lastIndex ? end : lastIndex);
          response(200,list.slice(begin,end+1));
        }else{
          response(200,[]);                                        //没更多未显示的数据时，返回空数组
        }
      }
    };
    if(msg.do === 'load'){
      this.storage.load(responseFilter);
    }
  },

  //专门用于操作播放列表
  playListHandler:function (msg,response){
    switch(msg.do)
    {
      case 'play':this.player.playOnList(msg.list,msg.index,response);break;
      case 'add':this.player.addToPlay(msg.list,msg.index,response);break;
      case 'delete':this.player.notToPlay(msg.index,response);break;
      case 'load':this.player.getPlayList(msg.page,response);break;
    }
  },

  //用于对播放器进行设置
  playerHandler:function (message,response){
    switch(message.do)
    {
      case 'paused':this.player.paused = message.value;break;
      case 'last':this.player.playSongIndex--;break;
      case 'next':this.player.playSongIndex++;break;
      case 'volume':this.player.volume = message.value;break;
      case 'progress':this.player.progress = message.value;break;
    }
    response(200,'对播放器设置成功');
  }
}