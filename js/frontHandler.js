/**
 * Created by Y-Star on 2017/3/18.
 */
var FrontHandlerClass = (function(){
  function FrontHandler(args) {
    //私有变量
    var $type = '';
    var $showData = [];
    var $list = document.getElementById('list').querySelector('ul');
    var liCopy = $list.querySelector('li').cloneNode(true);
    var $fragCache = document.createDocumentFragment();
    function request(message,callback) {
      console.log('request');
      chrome.runtime.sendMessage(message,function (response) {
        callback(response);
      });
    }
    //共有变量和方法
    return {
      get showType(){
        return $type;
      },
      set showType(newType){
        if(newType != $type){
          console.log('topList Click');
          //隐藏列表，以进行修改
          $list.style.display = 'none';
          $type = newType;
          $showData = [];
          this.loadSongs(1);
        }else{
          document.getElementBy.scrollTop = 0;//返回顶部
        }
      },
      get showData(){
        return $showData;
      },
      //请求加载展示第page页的数据//收藏、播放不同,不用再request()
      loadSongs:function (page) {
        console.log('topList Click' + page);
        switch($type)
        {
          case 'topList':{
            if($showData.length <= (page-1)*8){       //缓存的数据量不够，向后台请求更多数据
              request({handler:'topList',page:page},this.showResult.bind(this,(page-1)*8,(page*8-1)));
            }else{
              this.showResult((page-1)*8,(page*8-1),[]);
            }
          };break;

          case 'search':{           //搜索比较特殊，每次搜索都是获取第一页，后台是直接当作新搜索词来获取数据，把原来的数据全部丢弃，搜索结果没有缓存
            request({handler:'search',key:'',page:page},this.showResult.bind(this,(page-1)*8,(page*8-1)));
          };break;

          default:{             //当$type为playList、collect时，即是显示播放列表和收藏列表；
            if(page===1)        //在切换为playList和collect时，即第一次从后台获取数据，就能获取所有数据，以后不用再向后台请求
              request({handler:$type,do:'load'},this.showResult.bind(this,0,7));
            else
              this.showResult((page-1)*8,(page*8-1),[]);
          };break;
        }
      },
      //数据渲染函数
      showResult:function (begin,end,newData) {
        console.log('topList Click');
        //加入新数据
        newData.forEach(function(el){
          $showData.push(el);
        });
        var length = $showData.length;
        //length>begin时,已经有新的数据插入，或者缓冲的数据充足，能展示出来
        if(length > begin){
          end = ((length-1)<end)?(length-1):end;

          //获取所有li元素
          var lis = $list.querySelectorAll('li');
          var childCount = $list.childElementCount;
          var min = Math.min(childCount-1,end);

          //把li元素放进fragCache缓存区，再进行处理
          for(var i = begin ; i <= min ; i++){
            $fragCache.appendChild(lis[i]);
          }
          //若li不够，则复制liCopy进缓存区来补足li
          for(;i <= end ; i++){
            var li = liCopy.cloneNode(true);
            $fragCache.appendChild(li);
          }
          //清除多余的li
          for(;i < childCount;i++){
            lis[i].remove();
          }

          //对缓存区的li进行处理渲染
          $fragCache.querySelectorAll('.songName-l').forEach(function (el,i) {
            el.innerText = $showData[i+begin].song;
          });
          $fragCache.querySelectorAll('.singer-l').forEach(function (el,i) {
            el.innerText = $showData[i+begin].singer+' / '+parseInt($showData[i+begin].time/60)+':'+$showData[i+begin].time%60;
          });

          if($type === 'search'|| $type === 'topList'){
            $fragCache.querySelectorAll('.delete').forEach(function (el) {
              el.style.display = 'inline';
            });
            $fragCache.querySelectorAll('.addToPlay').forEach(function (el) {
              el.style.display = 'inline';
            });
            $fragCache.querySelectorAll('.delete').forEach(function (el) {
              el.style.display = 'none';
            });
          }
          if($type === 'playList'){
            $fragCache.querySelectorAll('.delete').forEach(function (el) {
              el.style.display = 'inline';
            });
            $fragCache.querySelectorAll('.addToPlay').forEach(function (el) {
              el.style.display = 'none';
            });
            $fragCache.querySelectorAll('.delete').forEach(function (el) {
              el.style.display = 'inline';
            });
          }
          if($type === 'collect'){
            $fragCache.querySelectorAll('.delete').forEach(function (el) {
              el.style.display = 'none';
            });
            $fragCache.querySelectorAll('.addToPlay').forEach(function (el) {
              el.style.display = 'inline';
            });
            $fragCache.querySelectorAll('.delete').forEach(function (el) {
              el.style.display = 'inline';
            });
          }
          //在$fragCache渲染完成后，追加到列表中，并显示列表
          $list.appendChild($fragCache);
        }else{
          //显示无更多数据
          document.getElementById('listBottom').innerText = 'no more songs!';
        }
        $list.style.display = 'block';
      }
    };


  }
  //实例容器
  var instance = undefined;
  return {
    //获取单例的方法
    getInstance:function(args){
      if(!instance)
        instance = new FrontHandler(args);
      return instance;
    }
  }
})();
var frontHandler = FrontHandlerClass.getInstance();
document.getElementById('topList').onclick = function () {
  frontHandler.showType = 'topList';
  console.log('topList Click');
};
document.getElementById('playList').onclick = function () {
  frontHandler.showType = 'playList';
  console.log('playList Click');
};
document.getElementById('collect').onclick = function () {
  frontHandler.showType = 'collect';
  console.log('collect Click');
};
document.getElementById('title').addEventListener('mouseover',function (e) {
  document.getElementById('setting').style.backgroundColor = 'rgba(0,0,0,0.4)';
  // e.currentTarget.style.top = '193px';
  e.currentTarget.parentNode.style.bottom = '58px';
  document.getElementById('controlArea').style.opacity = '1';
});
document.getElementById('setting').addEventListener('mouseleave',function (e) {
  document.getElementById('setting').style.backgroundColor = 'rgba(0,0,0,0)';
  // e.currentTarget.style.top = '263px';
  e.currentTarget.querySelector('.cover').style.bottom = '-3px';
  document.getElementById('controlArea').style.opacity = '0';
});
document.querySelector('.topList').addEventListener('click',function () {
  // document.querySelectorAll('section')[1].style.display = 'block';
  document.querySelectorAll('section')[1].style.opacity = '1';
  document.getElementById('content').style.height = '600px';
});
document.querySelector('.play').addEventListener('click',function (e) {
  var classes = e.target.classList;
  var el = e.target;
  // el.style.transition = 'border-right-width ease 0.3s';
  if(classes.contains('play')){
    classes.remove('play');
    classes.add('pause');
  }else{
    classes.remove('pause');
    classes.add('play');
  }

})