/**
 * Created by Y-Star on 2017/3/31.
 */
var frontHandler, UIManager, io;
//控件click事件处理器
function controlsClickHandler(e) {
  let classList = e.target.classList;
  //处理last上一曲
  if (classList.contains('last')) {
    frontHandler.lastNextOrPause('last');
  } else if (classList.contains('next')) {    //处理next下一曲
    frontHandler.lastNextOrPause('next');
  } else if (classList.contains('playBt')) {   //处理播放或暂停
    //切换类名，有该类名，则移除，并返回false；无则添加，并返回true
    classList.toggle('toPlay');
    //classList.toggle('toPause',true)返回true时，意味着有toPause类，音乐应该播放
    //audio的paused应该是false，所以对classList.toggle('toPause',true)取反
    let pausedBool = !classList.toggle('toPause');
    frontHandler.lastNextOrPause('paused', pausedBool);
    console.log('pausedBool' + pausedBool);
  } else if (classList.contains('topList')) {
    UIManager.showType = 'topList';
    //处理列表展开
    var section1 = document.querySelectorAll('section')[1];
    section1.style.display = 'block';
    section1.style.opacity = '1';
    document.getElementById('content').style.height = '600px';

    console.log('click : open list');
  } else if (classList.contains('volume')) {
    frontHandler.modifyBar('volume', 0);
  }
}
//setting区域mouseover事件处理器
function settingMOverHandler(e) {
  if (e.target.id == 'title') {
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
function barMDownHandler(e) {
  if (e.target.classList.contains('barEnd')) {
    var innerBar = e.target.parentNode;
    var previousX = e.clientX, moveX = 0, currentX = 0;
    var outerWidth = 0, innerWidth = parseFloat(innerBar.style.width);
    outerWidth = parseFloat(window.getComputedStyle(innerBar.parentNode).width);

    //对于有'data-editable'属性的，设置该属性为'false'属性值
    innerBar.dataset.modifiable && (innerBar.dataset.modifiable = false);
    document.addEventListener('mousemove', barMMoveHandler);
    document.addEventListener('mouseup', barMUpHandler);
    function barMMoveHandler(e1) {
      currentX = e1.clientX;
      moveX = currentX - previousX;
      //当移动的绝对值大于2时，才计算
      if (moveX <= -2 || moveX >= 2) {
        // 取分子来算，例如取20%里的分子20
        innerWidth += Math.ceil(moveX / outerWidth * 10000) / 100;
        // 限制innerWidth的width不超过outerWidth，即0<=resultWidth%<=1
        if (0 <= innerWidth && innerWidth <= 100) {
          innerBar.style.width = innerWidth + '%';
          previousX = currentX;
        } else {
          // 把超出范围的innerWidth值修正为100或0
          innerWidth = innerWidth > 100 ? 100 : 0;
        }
      }
    }

    function barMUpHandler(e2) {
      var doIt = '';
      if (innerBar.parentNode.classList.contains('volumeBar')){
        doIt = 'volume';
        e.target.title = Math.round(innerWidth/10) + ' / 10';
      }
      else
        doIt = 'progress';
      frontHandler.modifyBar(doIt, innerWidth / 100);
      //对于有'data-editable'属性的，设置该属性为'true'属性值
      innerBar.dataset.modifiable && (innerBar.dataset.modifiable = true);
      document.removeEventListener('mousemove', barMMoveHandler);
      document.removeEventListener('mouseup', barMUpHandler);
    }

  }
}

var choiceClickHandler = function (e) {
  var classList = e.target.classList;
  // 只处理icons的click事件
  if (!classList.contains('icons')) return;
  let newType = '';
  if (classList.contains('topList'))
    newType = 'topList';
  else {
    if (classList.contains('playList'))
      newType = 'playList';
    else {
      if (classList.contains('collections'))
        newType = 'collections';
      else {
        if (classList.contains('searchResult'))
          newType = 'searchResult';
      }
    }
  }
  UIManager.showType = newType;
};
function listClickHandler(e) {
  //ele是事件源对象  li是li元素，一开始为事件源对象，是因为事件源对象不一定是li元素，之后需要从事件源对象出发，沿DOM树找到事件源对象所处的li元素
  var ele = e.target;
  // 事件源对象的类名列表
  var classList = ele.classList;
  console.log('list click :');
  console.log(ele);

  if (classList.contains('icons')) {
    let li = ele.closest('li');
    if (li == null) {
      e.stopPropagation();
      return;
    } else {
      let lis = listWrapper.querySelectorAll('li');
      //li元素下标
      let index = [].indexOf.call(lis, li);
      switch (classList[classList.length - 1]) {
        case 'collect':
          UIManager.toCollect(index, ele);
          break;
        case 'addToPlay':
          UIManager.toAddToPlay(index, ele);
          break;
        case 'delete':
          UIManager.toRemoveFromList(index, li);
          break;
      }
    }
  }
}
function listDblclickHandler(e) {
  var ele = e.target, li = ele;
  var listWrapper = e.currentTarget;
  //li元素下标
  var index;
  li = li.closest('li');
  console.log('list dblclick :');
  console.log(ele);
  if (li == null) {
    e.stopPropagation();
    return;
  } else {
    let lis = listWrapper.querySelectorAll('li');
    index = [].indexOf.call(lis, li);
    UIManager.toPlayOnList(index);
  }
}
//通用事件绑定函数
function bindHandler(elId, type, handler) {
  document.getElementById(elId).addEventListener(type, handler);
}

window.onload = function () {

  UIManager = UIManagerClass.getInstance();
  frontHandler = FrontHandlerClass.getInstance();
  bindHandler('controlArea', 'click', controlsClickHandler);
  bindHandler('setting', 'mouseover', settingMOverHandler);
  bindHandler('setting', 'mouseleave', settingMLeaveHandler);
  bindHandler('setting', 'mousedown', barMDownHandler);
  bindHandler('choice', 'click', choiceClickHandler);
  bindHandler('listWrapper', 'click', listClickHandler);
  bindHandler('listWrapper', 'dblclick', listDblclickHandler);
  bindHandler('searchResult','change',e=>{
    UIManager.showType = 'searchResult';
  });
  var root = document.getElementById('listWrapper');
  io = new IntersectionObserver(function (entries) {
    // console.log('ratio: '+entries[0].intersectionRatio);
    if (entries[0].intersectionRatio <= 0) return;
    var page = Math.ceil(root.querySelector('ul').childNodes.length / 8 + 1);
    // console.log('page: '+page);
    UIManager.toLoadSongs(page);
  }, {
    root: root
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