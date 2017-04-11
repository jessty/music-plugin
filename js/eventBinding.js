/**
 * Created by Y-Star on 2017/3/31.
 */
var frontHandler,UIManager,io;
//控件click事件处理器
function controlsClickHandler(e) {
  let classList = e.target.classList;
  //处理last上一曲
  if(classList.contains('last')){
    frontHandler.lastNextOrPause('last');
  }else if(classList.contains('next')){    //处理next下一曲
    frontHandler.lastNextOrPause('next');
  }else if(classList.contains('playBt')){   //处理播放或暂停
    //切换类名，有该类名，则移除，并返回false；无则添加，并返回true
    classList.toggle('toPlay');
    //classList.toggle('toPause',true)返回true时，意味着有toPause类，音乐应该播放
    //audio的paused应该是false，所以对classList.toggle('toPause',true)取反
    let pausedBool = !classList.toggle('toPause');
    frontHandler.lastNextOrPause('paused',pausedBool);
    console.log('pausedBool'+pausedBool);
  }else if(classList.contains('topList')){
    UIManager.showType = 'topList';
    //处理列表展开
    var section1 = document.querySelectorAll('section')[1];
    section1.style.display = 'block';
    section1.style.opacity = '1';
    document.getElementById('content').style.height = '600px';

    console.log('click : open list');
  }else if(classList.contains('volume')){
    frontHandler.modifyBar('volume',0);
  }
}
//setting区域mouseover事件处理器
function settingMOverHandler(e) {
  if(e.target.id == 'title'){
    var currentTarget = e.currentTarget;
    currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)';
    currentTarget.firstElementChild.style.bottom = '60px';
    currentTarget.lastElementChild.style.opacity = '1';
  }
}
//setting区域mouseleave事件处理器
function settingMLeaveHandler(e) {
  e.target.style.backgroundColor = 'rgba(0,0,0,0)';
  e.target.firstElementChild.style.bottom = '0px';
  e.target.lastElementChild.style.opacity = '0';
}
//进度条事件
function barMDownHandler(e){
  if(e.target.classList.contains('barEnd')){
    var innerBar = e.target.parentNode;
    var previousX = e.clientX, moveX = 0, currentX = 0;
    var outerWidth = 0, innerWidth = parseFloat(innerBar.style.width);
    outerWidth = parseFloat(window.getComputedStyle(innerBar.parentNode).width);

    //对于有'data-editable'属性的，设置该属性为'false'属性值
    innerBar.dataset.modifiable && (innerBar.dataset.modifiable = false);
    document.addEventListener('mousemove',barMMoveHandler);
    document.addEventListener('mouseup',barMUpHandler);
    function barMMoveHandler(e1) {
      currentX = e1.clientX;
      moveX = currentX - previousX;
      //当移动的绝对值大于2时，才计算
      if(moveX<=-2||moveX>=2){
        // 取分子来算，例如取20%里的分子20
        innerWidth += Math.ceil(moveX/outerWidth*10000)/100;
        // 限制innerWidth的width不超过outerWidth，即0<=resultWidth%<=1
        if(0 <= innerWidth && innerWidth <= 100){
          innerBar.style.width = innerWidth+'%';
          previousX = currentX;
        }else{
          // 把超出范围的innerWidth值修正为100或0
          innerWidth = innerWidth>100?100:0;
        }
      }
    }
    function barMUpHandler(e2) {
      var doIt = '';
      if(innerBar.parentNode.classList.contains('volumeBar'))
        doIt = 'volume';
      else
        doIt = 'progress';
      frontHandler.modifyBar(doIt,innerWidth/100);
      //对于有'data-editable'属性的，设置该属性为'true'属性值
      innerBar.dataset.modifiable&&(innerBar.dataset.modifiable = true);
      document.removeEventListener('mousemove', barMMoveHandler);
      document.removeEventListener('mouseup', barMUpHandler);
    }

  }
}

function choiceClickHandler(e) {
  var classList = e.target.classList;
  // 只处理icons的click事件
  if(!classList.contains('icons')) return;
  var newType = classList[classList.length - 1];
  if(UIManager.showType == newType)
    UIManager.showType = newType;
  else{
    UIManager.showType = newType;
    io.unobserve(document.getElementById('listBottom'));
    io.observe(document.getElementById('listBottom'));
  }


  // if(classList.contains('topList')){
  //   UIManager.showType = 'topList';
  //   console.log('topList Click');
  // }else if(classList.contains('playList')){
  //   UIManager.showType = 'playList';
  //   console.log('playList Click');
  // }else if(classList.contains('collect')){
  //   UIManager.showType = 'collect';
  //   console.log('collect Click');
  // }else if(classList.contains('search')){
  //
  // }

}
function listClickHandler(e){
  var ele = e.target;
  var listWrapper = e.currentTarget;

  while(ele.tagName.toLowerCase() != 'li' && ele != listWrapper){
    ele = ele.parentNode;
  }
  console.log('list click :' + ele)
  if(ele != listWrapper){
    let lis = listWrapper.querySelectorAll('li');
    let index = [].indexOf.call(lis,ele);
    UIManager.toPlayOnList(index);
  }else{
    e.stopPropagation();
  }
}
//通用事件绑定函数
function bindHandler(elId, type, handler) {
  document.getElementById(elId).addEventListener(type,handler);
}

window.onload = function(){

  UIManager = UIManagerClass.getInstance();
  frontHandler = FrontHandlerClass.getInstance();
  bindHandler('controlArea','click',controlsClickHandler);
  bindHandler('setting','mouseover',settingMOverHandler);
  bindHandler('setting','mouseleave',settingMLeaveHandler);
  bindHandler('setting','mousedown',barMDownHandler);
  bindHandler('choice','click',choiceClickHandler);
  bindHandler('listWrapper','click',listClickHandler);
  var root = document.getElementById('listWrapper');
  io = new IntersectionObserver(function(entries){
    console.log('ratio: '+entries[0].intersectionRatio);
    if(entries[0].intersectionRatio <= 0) return;
    var page = Math.ceil(root.querySelector('ul').childNodes.length / 8 + 1);
    console.log('page: '+page);
    UIManager.toLoadSongs(page);
  },{
    root:root
  });
  io.observe(document.getElementById('listBottom'));
  // document.getElementById('playList').onclick = function () {
  //   UIManager.showType = 'playList';
  //   console.log('playList Click');
  // };
  // document.getElementById('collect').onclick = function () {
  //   UIManager.showType = 'collect';
  //   console.log('collect Click');
  // };
};