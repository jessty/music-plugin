/**
 * Created by Y-Star on 2017/2/10.
 */
var sharedData = {};

//用于更新播放进度的通信端口
var progressPort = chrome.runtime.connect({name:'back'});
var player = new Player(sharedData,progressPort);
progressPort.onMessage.addListener(function (msg, port) {
  if(port.name == 'front')
    player.setProgress(msg.progress);
});

var storage = new Storage(sharedData);
var network = new Network(sharedData);
//首次尝试初始化排行榜
try{
  network.getTopList(undefined,1);
}catch(e){
  console.log('getTopList error!');
}

chrome.runtime.onMessage.addListener(router);

function router(message,sender,sendResponse){
  switch (message.handler)
  {
    case 'search':searchHandler(message.key,message.page,sendResponse);break;//search
    case 'topList':getTopListHandler(message.page,sendResponse);break;//get top songs' list
    case 'collect':collectionsHandler(message,sendResponse);break;//get collections
    case 'playList':playListHandler(message,sendResponse);break;//处理播放列表相关的操作：1.点击歌曲时，选其所在列表作为播放列表
                                                          //2.添加歌曲为待会播放  3.从播放列表移除歌曲
    case 'player':playerHandler(message,sendResponse);break;//设置player，如：上下曲，暂停播放，调整音量
  }
  return true;
}

function searchHandler(key,page,sendResponse) {
  try{
    if(page == 1)
      sharedData.searchResult = undefined;                          //把搜索第一页结果，都当作新请求，清空之前的搜索结果
    network.search(key,page,sendResponse);                          //search songs ，传入sendResponse以便得到结果后返回数据给页面
  }
  catch (e){
    switch(e.message)
    {
      case 'timeout':sendResponse('“我一步一步往上爬”----网络儿哼唱');break;
      case 'error':sendResponse('网络儿罢工了！');break;
    }
  }
}

function getTopListHandler(page,sendResponse) {
  try {
    if (sharedData.topList === undefined || sharedData.topList.length === 0) {//没有topLsit数据，尝试获取
      network.getTopList(sendResponse, 1);
    }
    else if(page == 1){                                            //有topList数据，若只要第一页，则把已缓存的数据直接返回
      sendResponse(sharedData.topList);
    }else{
      network.getTopList(sendResponse, page);                      //有topList数据，若要其他页，尝试获取
    }
  }catch (e){
    switch(e.message)
    {
      case 'timeout':sendResponse('“我一步一步往上爬”----网络儿哼唱');break;
      case 'error':sendResponse('网络儿罢工了！');break;
    }
  }
}

function collectionsHandler(message,sendResponse) {
  if(message.do === 'add'){                                        //添加歌曲到收藏夹
    storage.collect(message.song,sendResponse);
    return;
  }

  if(message.do === 'delete'){                                     //从收藏夹删歌曲
    storage.abandon(message.songID,sendResponse);
    return;
  }

  var responseFilter = function(sendResponse,result){
    if(result.length == 0){                                        //加载收藏夹时，对结果进行筛选
      sendResponse('收藏夹空空的，正饥渴地望着你~~');
    }else{
      sendResponse(result);
    }
  };
  responseFilter = responseFilter.bind(null,sendResponse);
  if(message.do === 'load'){
    if(sharedData.collections === undefined){
      storage.load(responseFilter);
    }
    else if(sharedData.collections.length==0){
      sendResponse('收藏夹空空的，正饥渴地望着你~~');
    }
    else{
      sendResponse(sharedData.collections);
    }
  }
}

function playListHandler(message,sendResponse){
  if(message.do == 'play'){
    player.playOnList(message.list,message.index);
  }
  else if(message.do == 'add'){
    player.addToPlay(message.list,message.index,sendResponse);
  }
  else{
    player.notToPlay(message.index,sendResponse);
  }
}
function playerHandler(message,sendResponse){
  switch(message.do)
  {
    case 'pause':player.pause = message.bool;break;
    case 'volumn':player.volume = message.volumn;
    case 'last':player.playSong--;
    case 'next':player.playSong++;
  }
}
// chrome.runtime.sendMessage();

