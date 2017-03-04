/**
 * Created by Y-Star on 2017/2/10.
 */
var sharedData = {};
var player = new Player(sharedData);
var storage = new Storage(sharedData);
var network = new Network(sharedData);
//首次尝试初始化排行榜
try{
  network.getTopList(undefined,1);
}catch(e){
  console.log('getTopList error!');
}

chrome.runtime.onMessage.addListener(receiveHandler);

function receiveHandler(message,sender,sendResponse){
  switch (message.type)
  {
    case 's':searchHandler(message.key,message.page,sendResponse);break;//search
    case 't':getTopListHandler(message.page,sendResponse);break;//get top songs' list
    case 'c':collectionsHandler(message,sendResponse);break;//get collections
    case 'pl':
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

function sendHandler(){

}
chrome.runtime.sendMessage()
