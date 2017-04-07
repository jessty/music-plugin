/**
 * Created by Y-Star on 2017/2/10.
 */
//共享数据区，有topList、search的resultList、收藏的collections list；播放列表存放在player中，由player维护
console.log("back end");
var sharedData = {};
var player = new Player(sharedData);
var network = new Network(sharedData);
var storage = new Storage(sharedData);
var backHandler = new BackHandler(player,storage,network,sharedData);
try{
  backHandler.listen();
}
catch(e){

};
//首次尝试初始化排行榜
try{
  network.getTopList(undefined,1);
}catch(e){
  console.log('getTopList error!');
}


