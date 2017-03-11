/**
 * Created by Y-Star on 2017/2/10.
 */
//共享数据区，有topList、search的resultList、收藏的collections list；播放列表存放在player中，由player维护
console.log("back end");
var sharedData = {};
//用于更新播放进度的通信端口
var progressPort = chrome.runtime.connect({name:'back'});
var player = new Player(sharedData,progressPort);
var storage = new Storage(sharedData);
var network = new Network(sharedData);
var backHandler = new BackHandler(player,storage,network,sharedData);

backHandler.listen(progressPort);
//首次尝试初始化排行榜
try{
  network.getTopList(undefined,1);
}catch(e){
  console.log('getTopList error!');
}


